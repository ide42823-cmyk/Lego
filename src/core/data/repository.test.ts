import { devControls, fixtureDataSource } from './repository';
import type { RoomFeedItem, RoomSummary } from './types';

/**
 * The fixtures are a development seam, but the *contract* they implement is the
 * same one the real API will have. These tests pin that contract: pagination,
 * filtering, interleaved promoted content, and like reconciliation.
 */
beforeAll(() => {
  // No artificial latency in tests.
  devControls.latencyMs = 0;
});

afterEach(() => {
  devControls.failReads = 0;
});

/** Room entries of a feed, ignoring promoted content. */
function roomsOf(items: readonly RoomFeedItem[]): RoomSummary[] {
  return items.flatMap((item) => (item.kind === 'room' ? [item.room] : []));
}

describe('listPeople', () => {
  it('returns a page and a cursor for the next one', async () => {
    const page = await fixtureDataSource.listPeople('recommend', { limit: 5 });

    expect(page.items).toHaveLength(5);
    expect(page.nextCursor).toBe('5');
  });

  it('reports a null cursor once the list is exhausted', async () => {
    const page = await fixtureDataSource.listPeople('recommend', { limit: 500 });

    expect(page.nextCursor).toBeNull();
  });

  it('walks pages without repeating or dropping entries', async () => {
    const first = await fixtureDataSource.listPeople('new', { limit: 6 });
    const second = await fixtureDataSource.listPeople('new', {
      cursor: first.nextCursor,
      limit: 6,
    });

    const ids = [...first.items, ...second.items].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('interleaves promotional banners with people', async () => {
    const page = await fixtureDataSource.listPeople('recommend', { limit: 12 });
    const kinds = page.items.map((item) => item.kind);

    expect(kinds).toContain('user');
    expect(kinds).toContain('banner');
  });

  it('attaches a bucketed distance to every directory row', async () => {
    const modes = ['nearby', 'recommend', 'new', 'featured'] as const;

    for (const mode of modes) {
      const page = await fixtureDataSource.listPeople(mode, { limit: 6 });
      const users = page.items.filter((item) => item.kind === 'user');

      expect(users).not.toHaveLength(0);
      expect(users.every((item) => typeof item.user.distanceKm === 'number')).toBe(true);
    }
  });

  it('orders the nearby directory closest-first', async () => {
    const page = await fixtureDataSource.listPeople('nearby', { limit: 6 });
    const distances = page.items
      .filter((item) => item.kind === 'user')
      .map((item) => item.user.distanceKm ?? 0);

    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });
});

describe('listRooms', () => {
  it('leads the first page with the directory promotion', async () => {
    const page = await fixtureDataSource.listRooms('recommend', { limit: 8 });

    expect(page.items[0]?.kind).toBe('banner');
  });

  it('restricts the video directory to video rooms', async () => {
    const page = await fixtureDataSource.listRooms('video', { limit: 50 });
    const rooms = roomsOf(page.items);

    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms.every((room) => room.category === 'video')).toBe(true);
  });

  it('returns fewer rooms for the joined filter than for following', async () => {
    const joined = await fixtureDataSource.listRooms('me', { limit: 50, relationship: 'joined' });
    const following = await fixtureDataSource.listRooms('me', {
      limit: 50,
      relationship: 'following',
    });

    expect(roomsOf(following.items).length).toBeGreaterThan(roomsOf(joined.items).length);
  });

  it('sorts the recommend directory by participant count', async () => {
    const page = await fixtureDataSource.listRooms('recommend', { limit: 8 });
    const counts = roomsOf(page.items).map((room) => room.participantCount);

    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });
});

describe('listConversations', () => {
  it('returns only unread conversations for the unread filter', async () => {
    const page = await fixtureDataSource.listConversations('unread', { limit: 50 });

    expect(page.items.every((conversation) => conversation.unreadCount > 0)).toBe(true);
  });

  it('returns only online peers for the online filter', async () => {
    const page = await fixtureDataSource.listConversations('online', { limit: 50 });

    expect(page.items.every((conversation) => conversation.isOnline)).toBe(true);
  });
});

describe('listMoments', () => {
  it('carries the author level and name from the directory', async () => {
    const moments = await fixtureDataSource.listMoments('recommend', { limit: 50 });
    const people = await fixtureDataSource.listPeople('recommend', { limit: 200 });

    expect(moments.items.length).toBeGreaterThan(0);

    // A feed card must never disagree with the same person's row elsewhere.
    expect(moments.items.every((post) => (post.authorLevel ?? 0) > 0)).toBe(true);

    const authors = new Map(
      people.items.filter((item) => item.kind === 'user').map((item) => [item.user.id, item.user]),
    );

    for (const post of moments.items) {
      const author = authors.get(post.authorId);
      expect(author).toBeDefined();
      expect(post.authorName).toBe(author?.displayName);
      expect(post.authorLevel).toBe(author?.level);
    }
  });
});

describe('setMomentLiked', () => {
  it('is idempotent and reversible', async () => {
    const feed = await fixtureDataSource.listMoments('recommend', { limit: 1 });
    const target = feed.items[0];
    expect(target).toBeDefined();
    if (!target) {
      return;
    }

    const baseline = await fixtureDataSource.setMomentLiked(target.id, false);
    expect(baseline.likedByMe).toBe(false);

    const liked = await fixtureDataSource.setMomentLiked(target.id, true);
    expect(liked.likedByMe).toBe(true);
    expect(liked.likeCount).toBe(baseline.likeCount + 1);

    // Liking twice must not double-count.
    const likedAgain = await fixtureDataSource.setMomentLiked(target.id, true);
    expect(likedAgain.likeCount).toBe(baseline.likeCount + 1);

    const undone = await fixtureDataSource.setMomentLiked(target.id, false);
    expect(undone.likeCount).toBe(baseline.likeCount);
  });

  it('rejects an unknown moment', async () => {
    await expect(fixtureDataSource.setMomentLiked('nope', true)).rejects.toThrow(/Unknown moment/);
  });
});

describe('getProfile', () => {
  it('returns the profile for a member the directories also list', async () => {
    const page = await fixtureDataSource.listPeople('recommend', { limit: 1 });
    const first = page.items.flatMap((item) => (item.kind === 'user' ? [item.user] : []))[0];
    expect(first).toBeDefined();

    const profile = await fixtureDataSource.getProfile(first.id);

    // The profile can never contradict the row that opened it.
    expect(profile.id).toBe(first.id);
    expect(profile.displayName).toBe(first.displayName);
    expect(profile.level).toBe(first.level);
    expect(profile.badges).toEqual(first.badges);
  });

  it('always exposes all three honour walls', async () => {
    const profile = await fixtureDataSource.getProfile('user-1');

    expect(profile.honor.map((wall) => wall.key)).toEqual(['badges', 'titles', 'gifts']);
  });

  it('keeps an honour wall that is empty rather than dropping the section', async () => {
    // Walls are derived from the member's own badges and titles, so an empty
    // collection is a real state. The fixtures must exercise it, otherwise the
    // placeholder slots would be a path nothing ever renders.
    const profiles = await Promise.all(
      Array.from({ length: 12 }, (_, index) => fixtureDataSource.getProfile(`user-${index + 1}`)),
    );

    expect(profiles.every((profile) => profile.honor.length === 3)).toBe(true);
    expect(profiles.some((profile) => profile.honor[1].entries.length === 0)).toBe(true);
  });

  it('carries the member number on the ID row and nowhere else', async () => {
    const profile = await fixtureDataSource.getProfile('user-1');
    const idRows = profile.info.filter((row) => row.copyable);

    expect(idRows).toHaveLength(1);
    expect(idRows[0].text).toMatch(/^ID \d{9}$/);
    expect(idRows[0].copyValue).toBe(idRows[0].text.replace('ID ', ''));
  });

  it('never exposes a precise address', async () => {
    const profile = await fixtureDataSource.getProfile('user-1');
    const address = profile.info.find((row) => row.key === 'address');

    // Country level only: the same privacy rule the directory rows follow.
    expect(address?.text).not.toMatch(/\d/);
  });

  it('shares post objects with the moments feed', async () => {
    const profile = await fixtureDataSource.getProfile('user-1');
    const feed = await fixtureDataSource.listMoments('recommend', { limit: 50 });
    const shared = feed.items.find((post) =>
      profile.moments.some((moment) => moment.id === post.id),
    );

    if (shared) {
      const own = profile.moments.find((moment) => moment.id === shared.id);
      expect(own).toBe(shared);
    }
  });

  it('rejects an unknown member', async () => {
    await expect(fixtureDataSource.getProfile('nope')).rejects.toThrow(/Unknown member/);
  });
});

describe('avatar frames', () => {
  it('dresses a member the same way in every surface', async () => {
    const people = await fixtureDataSource.listPeople('recommend', { limit: 200 });
    const rows = people.items.flatMap((item) => (item.kind === 'user' ? [item.user] : []));
    const framed = rows.filter((user) => user.avatarFrame);

    // The fixtures must exercise frames, or nothing renders one.
    expect(framed.length).toBeGreaterThan(0);

    for (const row of framed) {
      const profile = await fixtureDataSource.getProfile(row.id);
      expect(profile.avatarFrame).toBe(row.avatarFrame);

      const feed = await fixtureDataSource.listMoments('recommend', { limit: 100 });
      const post = feed.items.find((item) => item.authorId === row.id);
      if (post) {
        expect(post.avatarFrame).toBe(row.avatarFrame);
      }
    }
  });

  it('carries the peer frame onto relationship cards', async () => {
    const people = await fixtureDataSource.listPeople('recommend', { limit: 200 });
    const frames = new Map(
      people.items.flatMap((item) =>
        item.kind === 'user' ? [[item.user.id, item.user] as const] : [],
      ),
    );

    // A member with a couple and friends, so both card kinds are covered.
    const profile = await fixtureDataSource.getProfile('user-3');
    const records = [...(profile.couple ? [profile.couple] : []), ...profile.friends];

    expect(records.length).toBeGreaterThan(0);

    for (const record of records) {
      expect(record.peerFrame).toBe(frames.get(record.peerId)?.avatarFrame);
    }
  });

  it('reserves the animated frame for the account itself', async () => {
    // `halo` is the one animated frame. Sixty frames of alpha in a scrolling
    // list is work the device should not do for decoration, so the fixtures
    // never hand it to a directory row, a post or a conversation.
    const me = await fixtureDataSource.getMe();
    expect(me.avatarFrame).toBe('halo');

    const people = await fixtureDataSource.listPeople('recommend', { limit: 200 });
    expect(
      people.items.every((item) => item.kind !== 'user' || item.user.avatarFrame !== 'halo'),
    ).toBe(true);

    const feed = await fixtureDataSource.listMoments('recommend', { limit: 100 });
    expect(feed.items.every((post) => post.avatarFrame !== 'halo')).toBe(true);

    const inbox = await fixtureDataSource.listConversations('all', { limit: 100 });
    expect(inbox.items.every((conversation) => conversation.avatarFrame !== 'halo')).toBe(true);
  });
});

describe('sendGreeting', () => {
  it('is idempotent and reports the confirmed state', async () => {
    await expect(fixtureDataSource.sendGreeting('user-1')).resolves.toEqual({ greeted: true });
    await expect(fixtureDataSource.sendGreeting('user-1')).resolves.toEqual({ greeted: true });
  });

  it('rejects an unknown member', async () => {
    await expect(fixtureDataSource.sendGreeting('nope')).rejects.toThrow(/Unknown member/);
  });
});

describe('searchPeople', () => {
  it('finds a member by name and reports the full match count', async () => {
    const page = await fixtureDataSource.searchPeople('maya', { limit: 1 });

    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.displayName.startsWith('Maya')).toBe(true);
    expect(page.total).toBeGreaterThanOrEqual(1);
  });

  it('finds a member by the country name behind their locale hint', async () => {
    const page = await fixtureDataSource.searchPeople('saudi arabia', { limit: 50 });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((user) => user.locale === 'SA')).toBe(true);
  });

  it('folds Arabic spelling variants', async () => {
    // The fixtures name someone نورة and someone لمى; a phone keyboard often
    // writes those with ه and ي instead.
    const taMarbuta = await fixtureDataSource.searchPeople('نوره', { limit: 50 });
    const alefMaqsura = await fixtureDataSource.searchPeople('لمي', { limit: 50 });

    expect(taMarbuta.items.some((user) => user.displayName === 'نورة')).toBe(true);
    expect(alefMaqsura.items.some((user) => user.displayName === 'لمى')).toBe(true);
  });

  it('pages through matches without repeating one', async () => {
    const first = await fixtureDataSource.searchPeople('a', { limit: 5 });
    const second = await fixtureDataSource.searchPeople('a', {
      cursor: first.nextCursor,
      limit: 5,
    });
    const ids = [...first.items, ...second.items].map((user) => user.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(second.total).toBe(first.total);
  });

  it('returns an empty page for a query that matches nothing', async () => {
    const page = await fixtureDataSource.searchPeople('zzzzzz', { limit: 10 });

    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBeNull();
    expect(page.total).toBe(0);
  });
});

describe('searchRooms', () => {
  it('finds a room by its own name', async () => {
    const all = await fixtureDataSource.listRooms('new', { limit: 100 });
    const entry = all.items.find((item) => item.kind === 'room');

    expect(entry).toBeDefined();
    if (!entry || entry.kind !== 'room') {
      return;
    }

    const page = await fixtureDataSource.searchRooms(entry.room.name, { limit: 50 });

    expect(page.items.some((room) => room.id === entry.room.id)).toBe(true);
    expect(page.total).toBeGreaterThanOrEqual(page.items.length);
  });

  it('matches the category label the card prints', async () => {
    const page = await fixtureDataSource.searchRooms('families', { limit: 50 });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((room) => room.category === 'families')).toBe(true);
  });

  it('matches Arabic topics', async () => {
    const page = await fixtureDataSource.searchRooms('موسيقى', { limit: 50 });

    expect(page.items.length).toBeGreaterThan(0);
  });

  it('returns an empty page for a query that matches nothing', async () => {
    const page = await fixtureDataSource.searchRooms('zzzzzz', { limit: 10 });

    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
  });
});

describe('getSearchSuggestions', () => {
  it('derives unique terms from the fixtures', async () => {
    const suggestions = await fixtureDataSource.getSearchSuggestions();

    expect(suggestions.people.length).toBeGreaterThan(0);
    expect(suggestions.rooms.length).toBeGreaterThan(0);
    expect(new Set(suggestions.people).size).toBe(suggestions.people.length);
    expect(new Set(suggestions.rooms).size).toBe(suggestions.rooms.length);
  });

  it('only suggests terms that actually return results', async () => {
    const { people, rooms } = await fixtureDataSource.getSearchSuggestions();

    for (const term of people) {
      const page = await fixtureDataSource.searchPeople(term, { limit: 1 });
      expect(page.total).toBeGreaterThan(0);
    }

    for (const term of rooms) {
      const page = await fixtureDataSource.searchRooms(term, { limit: 1 });
      expect(page.total).toBeGreaterThan(0);
    }
  });
});

describe('failure simulation', () => {
  it('rejects the configured number of reads and then recovers', async () => {
    devControls.failReads = 1;

    await expect(fixtureDataSource.listMoments('recommend')).rejects.toThrow(/Simulated/);
    await expect(fixtureDataSource.listMoments('recommend')).resolves.toBeDefined();
  });
});

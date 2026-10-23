import { devControls, fixtureDataSource } from './repository';
import type {
  ChatMessage,
  ConversationSummary,
  DirectoryFeedItem,
  RoomFeedItem,
  RoomSummary,
} from './types';
import { defaultPeopleFilters } from '../people-filters';

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

/** Member entries of a feed, ignoring promoted content. */
function usersOf(items: readonly DirectoryFeedItem[]) {
  return items.flatMap((item) => (item.kind === 'user' ? [item.user] : []));
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

describe('people filter options and listPeople filters', () => {
  it('offers unique, data-derived facets with on-grid bounds', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();

    expect(options.age.min).toBeGreaterThanOrEqual(18);
    expect(options.age.max).toBeGreaterThan(options.age.min);
    expect(options.distanceKm.max).toBeGreaterThanOrEqual(50);
    expect(options.distanceKm.max % options.distanceKm.step).toBe(0);
    expect(options.countries.length).toBeGreaterThan(0);
    expect(options.languages.length).toBeGreaterThan(0);
    expect(new Set(options.countries.map((option) => option.value)).size).toBe(
      options.countries.length,
    );
    expect(new Set(options.languages.map((option) => option.value)).size).toBe(
      options.languages.length,
    );
  });

  it('leaves the feed unchanged at the defaults', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const plain = await fixtureDataSource.listPeople('recommend', { limit: 100 });
    const filtered = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      defaultPeopleFilters(options),
    );

    expect(filtered.items.map((item) => item.id)).toEqual(plain.items.map((item) => item.id));
  });

  it('filters by gender and online state', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const page = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      { ...defaultPeopleFilters(options), gender: 'female', onlineOnly: true },
    );
    const users = usersOf(page.items);

    expect(users.length).toBeGreaterThan(0);
    expect(users.every((user) => user.gender === 'female' && user.isOnline)).toBe(true);
  });

  it('filters by country and by language', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const country = options.countries[0]!;
    const language = options.languages[0]!;

    const byCountry = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      { ...defaultPeopleFilters(options), country: country.value },
    );
    const byLanguage = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      { ...defaultPeopleFilters(options), language: language.value },
    );

    expect(usersOf(byCountry.items).length).toBeGreaterThan(0);
    expect(usersOf(byCountry.items).every((user) => user.locale === country.value)).toBe(true);
    expect(usersOf(byLanguage.items).length).toBeGreaterThan(0);
    expect(usersOf(byLanguage.items).every((user) => user.language === language.value)).toBe(true);
  });

  it('enforces a narrowed age range', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const page = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      {
        ...defaultPeopleFilters(options),
        ageMin: options.age.min,
        ageMax: options.age.min,
      },
    );
    const users = usersOf(page.items);

    expect(users.length).toBeGreaterThan(0);
    expect(users.every((user) => user.age === options.age.min)).toBe(true);
  });

  it('enforces a narrowed distance range', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const page = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      { ...defaultPeopleFilters(options), distanceMaxKm: 100 },
    );
    const users = usersOf(page.items);

    expect(users.every((user) => (user.distanceKm ?? 0) <= 100)).toBe(true);
  });

  it('returns no entries, and no promotion, when nothing matches', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const page = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 100 },
      { ...defaultPeopleFilters(options), distanceMaxKm: 0 },
    );

    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBeNull();
  });

  it('paginates the filtered feed without duplicates', async () => {
    const options = await fixtureDataSource.getPeopleFilterOptions();
    const filters = { ...defaultPeopleFilters(options), gender: 'female' as const };
    const first = await fixtureDataSource.listPeople('recommend', { limit: 3 }, filters);
    const second = await fixtureDataSource.listPeople(
      'recommend',
      { limit: 3, cursor: first.nextCursor },
      filters,
    );
    const users = usersOf([...first.items, ...second.items]);
    const ids = [...first.items, ...second.items].map((item) => item.id);

    expect(users.every((user) => user.gender === 'female')).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
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

  it('returns only starred chats for the favorites filter', async () => {
    const page = await fixtureDataSource.listConversations('favorites', { limit: 50 });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((conversation) => conversation.isFavorite)).toBe(true);
  });

  describe('listMessages', () => {
    it('returns a thread whose last bubble is the inbox snippet, oldest first', async () => {
      const inbox = await fixtureDataSource.listConversations('all', { limit: 50 });
      const conversation = inbox.items[0] as ConversationSummary;
      const thread = await fixtureDataSource.listMessages(conversation.id);

      const times = thread.messages.map((message) => message.sentAt);
      expect([...times].sort()).toEqual(times);

      const last = thread.messages.at(-1) as ChatMessage;
      expect(last.text).toBe(conversation.snippet);
    });

    it('runs a strict two-party thread, with server strips being the only other voice', async () => {
      const inbox = await fixtureDataSource.listConversations('all', { limit: 50 });
      const conversation = inbox.items[0] as ConversationSummary;
      const thread = await fixtureDataSource.listMessages(conversation.id);

      const authors = new Set(
        thread.messages
          .filter((message) => message.kind !== 'milestone')
          .map((message) => message.authorId),
      );
      expect([...authors].sort()).toStrictEqual([conversation.peerId, 'user-me'].sort());
      // Milestones belong to nobody.
      expect(
        thread.messages.every((message) => message.authorId !== '' || message.kind === 'milestone'),
      ).toBe(true);
    });

    it('rejects an unknown conversation id instead of an empty thread', async () => {
      await expect(fixtureDataSource.listMessages('conversation-does-not-exist')).rejects.toThrow(
        /Unknown conversation/,
      );
    });
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
    expect(page.items[0]?.displayName).toContain('Maya');
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

    expect(taMarbuta.items.some((user) => user.displayName.includes('نورة'))).toBe(true);
    expect(alefMaqsura.items.some((user) => user.displayName.includes('لمى'))).toBe(true);
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

  it('restricts the Families tab to family rooms', async () => {
    const page = await fixtureDataSource.searchRooms('families', {
      limit: 50,
      category: 'families',
    });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((room) => room.category === 'families')).toBe(true);
    expect(page.total).toBe(page.items.length);
  });

  it('accepts the singular "family" as well as the category label', async () => {
    const page = await fixtureDataSource.searchRooms('family', {
      limit: 50,
      category: 'families',
    });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((room) => room.category === 'families')).toBe(true);
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
    expect(suggestions.families.length).toBeGreaterThan(0);
    expect(new Set(suggestions.people).size).toBe(suggestions.people.length);
    expect(new Set(suggestions.rooms).size).toBe(suggestions.rooms.length);
    expect(new Set(suggestions.families).size).toBe(suggestions.families.length);
  });

  it('only suggests terms that actually return results', async () => {
    const { people, rooms, families } = await fixtureDataSource.getSearchSuggestions();

    for (const term of people) {
      const page = await fixtureDataSource.searchPeople(term, { limit: 1 });
      expect(page.total).toBeGreaterThan(0);
    }

    for (const term of rooms) {
      const page = await fixtureDataSource.searchRooms(term, { limit: 1 });
      expect(page.total).toBeGreaterThan(0);
    }

    for (const term of families) {
      const page = await fixtureDataSource.searchRooms(term, {
        limit: 1,
        category: 'families',
      });
      expect(page.total).toBeGreaterThan(0);
    }
  });
});

describe('listLeaderboard', () => {
  it('returns contiguous ranks sorted by a descending score', async () => {
    const board = await fixtureDataSource.listLeaderboard('charm', 'daily');

    expect(board.category).toBe('charm');
    expect(board.period).toBe('daily');
    expect(board.unavailable).toBeUndefined();
    expect(board.region).toBeNull();
    expect(board.regions.length).toBeGreaterThan(0);
    expect(board.entries.length).toBeGreaterThanOrEqual(3);
    expect(board.entries.map((entry) => entry.rank)).toEqual(
      board.entries.map((_, index) => index + 1),
    );

    const scores = board.entries.map((entry) => entry.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(board.entries.every((entry) => entry.kind === 'member')).toBe(true);
    expect(board.entries.every((entry) => entry.valueLabel.length > 0)).toBe(true);
  });

  it('uses the New users directory as the Newcomer cohort', async () => {
    const page = await fixtureDataSource.listPeople('new', { limit: 100 });
    const newIds = new Set(usersOf(page.items).map((user) => user.id));
    const board = await fixtureDataSource.listLeaderboard('newcomer', 'daily');

    expect(board.entries.length).toBeGreaterThanOrEqual(3);
    expect(board.entries.every((entry) => newIds.has(entry.id))).toBe(true);
  });

  it('gives every period a larger scale than the one before', async () => {
    const daily = await fixtureDataSource.listLeaderboard('charm', 'daily');
    const weekly = await fixtureDataSource.listLeaderboard('charm', 'weekly');
    const monthly = await fixtureDataSource.listLeaderboard('charm', 'monthly');

    expect(weekly.entries[0]?.score ?? 0).toBeGreaterThan(daily.entries[0]?.score ?? 0);
    expect(monthly.entries[0]?.score ?? 0).toBeGreaterThan(weekly.entries[0]?.score ?? 0);
  });

  it('ranks room activity with the host line attached', async () => {
    const board = await fixtureDataSource.listLeaderboard('room', 'weekly');

    expect(board.entries.length).toBeGreaterThanOrEqual(3);
    expect(board.entries.every((entry) => entry.kind === 'room')).toBe(true);
    expect(board.entries.every((entry) => entry.subtitle?.startsWith('Host ·'))).toBe(true);

    const scores = board.entries.map((entry) => entry.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('reports Games and Family as unavailable instead of inventing rows', async () => {
    for (const category of ['games', 'family'] as const) {
      for (const period of ['daily', 'weekly', 'monthly'] as const) {
        const board = await fixtureDataSource.listLeaderboard(category, period);

        expect(board.category).toBe(category);
        expect(board.period).toBe(period);
        expect(board.entries).toEqual([]);
        expect(board.regions).toEqual([]);
        expect(board.region).toBeNull();
        expect(board.unavailable?.title).toMatch(/^No .+ rankings yet$/);
        expect(board.unavailable?.message).toMatch(/backend phase/);
      }
    }
  });

  it('lists every region actually present on the board, sorted by label', async () => {
    const board = await fixtureDataSource.listLeaderboard('charm', 'daily');

    expect(new Set(board.regions.map((option) => option.value)).size).toBe(board.regions.length);
    expect(board.regions.every((option) => option.label.length > 0)).toBe(true);
    const labels = board.regions.map((option) => option.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    expect(board.entries.every((entry) => entry.locale)).toBe(true);
  });

  it('filters by region and renumbers the remaining ranks', async () => {
    const board = await fixtureDataSource.listLeaderboard('charm', 'daily');
    const region = board.regions[0];
    expect(region).toBeDefined();
    if (!region) {
      throw new Error('Expected a region');
    }

    const filtered = await fixtureDataSource.listLeaderboard('charm', 'daily', region.value);

    expect(filtered.region).toBe(region.value);
    expect(filtered.entries.length).toBeGreaterThan(0);
    expect(filtered.entries.every((entry) => entry.locale?.toUpperCase() === region.value)).toBe(
      true,
    );
    expect(filtered.entries.map((entry) => entry.rank)).toEqual(
      filtered.entries.map((_, index) => index + 1),
    );
    expect(filtered.regions).toEqual(board.regions);
  });

  it('filters room boards by the room region too', async () => {
    const board = await fixtureDataSource.listLeaderboard('room', 'weekly');
    const region = board.regions[0];
    expect(region).toBeDefined();
    if (!region) {
      throw new Error('Expected a region');
    }

    const filtered = await fixtureDataSource.listLeaderboard('room', 'weekly', region.value);

    expect(filtered.entries.length).toBeGreaterThan(0);
    expect(filtered.entries.every((entry) => entry.locale?.toUpperCase() === region.value)).toBe(
      true,
    );
  });

  it('returns an honest empty slice for a region with no rankings', async () => {
    const board = await fixtureDataSource.listLeaderboard('charm', 'daily', 'ZZ');

    expect(board.entries).toEqual([]);
    expect(board.region).toBe('ZZ');
    expect(board.regions.length).toBeGreaterThan(0);
  });

  it('is deterministic and hands back isolated rows', async () => {
    const first = await fixtureDataSource.listLeaderboard('wealth', 'monthly');
    const second = await fixtureDataSource.listLeaderboard('wealth', 'monthly');

    expect(second).toEqual(first);

    const originalName = first.entries[0]?.name;
    const top = first.entries[0];
    expect(top).toBeDefined();
    if (!top) {
      throw new Error('Expected a ranked row');
    }
    top.name = 'Changed by a caller';
    top.score = -1;

    const third = await fixtureDataSource.listLeaderboard('wealth', 'monthly');
    expect(third.entries[0]?.name).toBe(originalName);
    expect(third.entries[0]?.score ?? -1).toBeGreaterThan(-1);
  });
});

describe('failure simulation', () => {
  it('rejects the configured number of reads and then recovers', async () => {
    devControls.failReads = 1;

    await expect(fixtureDataSource.listMoments('recommend')).rejects.toThrow(/Simulated/);
    await expect(fixtureDataSource.listMoments('recommend')).resolves.toBeDefined();
  });
});

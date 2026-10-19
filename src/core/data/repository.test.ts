import { devControls, fixtureDataSource } from './repository';

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

  it('only attaches bucketed distance in the nearby directory', async () => {
    const nearby = await fixtureDataSource.listPeople('nearby', { limit: 4 });
    const nearbyUsers = nearby.items.filter((item) => item.kind === 'user');
    expect(nearbyUsers).not.toHaveLength(0);
    expect(nearbyUsers.every((item) => typeof item.user.distanceKm === 'number')).toBe(true);

    const recommend = await fixtureDataSource.listPeople('recommend', { limit: 4 });
    const recommendUsers = recommend.items.filter((item) => item.kind === 'user');
    expect(recommendUsers.every((item) => item.user.distanceKm === undefined)).toBe(true);
  });
});

describe('listRooms', () => {
  it('restricts the video directory to video rooms', async () => {
    const page = await fixtureDataSource.listRooms('video', { limit: 50 });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((room) => room.category === 'video')).toBe(true);
  });

  it('returns fewer rooms for the joined filter than for following', async () => {
    const joined = await fixtureDataSource.listRooms('me', { limit: 50, relationship: 'joined' });
    const following = await fixtureDataSource.listRooms('me', {
      limit: 50,
      relationship: 'following',
    });

    expect(following.items.length).toBeGreaterThan(joined.items.length);
  });

  it('sorts the recommend directory by participant count', async () => {
    const page = await fixtureDataSource.listRooms('recommend', { limit: 8 });
    const counts = page.items.map((room) => room.participantCount);

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

describe('failure simulation', () => {
  it('rejects the configured number of reads and then recovers', async () => {
    devControls.failReads = 1;

    await expect(fixtureDataSource.listMoments('recommend')).rejects.toThrow(/Simulated/);
    await expect(fixtureDataSource.listMoments('recommend')).resolves.toBeDefined();
  });
});

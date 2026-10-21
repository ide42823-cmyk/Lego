import {
  isLeaderboardCategory,
  isLeaderboardPeriod,
  LEADERBOARD_CATEGORIES,
  LEADERBOARD_PERIODS,
  splitPodium,
} from './leaderboard';

describe('leaderboard vocabulary', () => {
  it('keeps the reference category order', () => {
    expect(LEADERBOARD_CATEGORIES).toEqual([
      'charm',
      'wealth',
      'newcomer',
      'room',
      'games',
      'family',
    ]);
  });

  it('offers the three periods in daily-to-monthly order', () => {
    expect(LEADERBOARD_PERIODS).toEqual(['daily', 'weekly', 'monthly']);
  });

  it('guards route params and rejects near misses', () => {
    expect(isLeaderboardCategory('room')).toBe(true);
    expect(isLeaderboardCategory('families')).toBe(false);
    expect(isLeaderboardCategory(undefined)).toBe(false);
    expect(isLeaderboardCategory(3)).toBe(false);

    expect(isLeaderboardPeriod('monthly')).toBe(true);
    expect(isLeaderboardPeriod('today')).toBe(false);
    expect(isLeaderboardPeriod(null)).toBe(false);
  });
});

describe('splitPodium', () => {
  it('returns empty slices for an empty board', () => {
    expect(splitPodium([])).toEqual({ podium: [], rest: [] });
  });

  it('keeps a short board entirely on the podium', () => {
    expect(splitPodium(['a', 'b'])).toEqual({ podium: ['a', 'b'], rest: [] });
  });

  it('moves ranks 4 and below into the list', () => {
    const entries = ['one', 'two', 'three', 'four', 'five'];

    expect(splitPodium(entries)).toEqual({
      podium: ['one', 'two', 'three'],
      rest: ['four', 'five'],
    });
  });

  it('does not mutate or reference the caller array', () => {
    const entries = ['one', 'two', 'three', 'four'];
    const split = splitPodium(entries);

    split.podium.push('five');
    expect(entries).toEqual(['one', 'two', 'three', 'four']);
  });
});

import { addRecentSearch, MAX_RECENT_SEARCHES, removeRecentSearch } from './search-recents';

describe('addRecentSearch', () => {
  it('ignores blank input', () => {
    const list = ['maya'];

    expect(addRecentSearch(list, '   ')).toBe(list);
  });

  it('trims and collapses whitespace', () => {
    expect(addRecentSearch([], '  sunset   lounge ')).toEqual(['sunset lounge']);
  });

  it('moves a repeat to the front instead of duplicating it', () => {
    expect(addRecentSearch(['maya', 'leo'], 'MAYA')).toEqual(['MAYA', 'leo']);
  });

  it('keeps the newest spelling of a repeated term', () => {
    expect(addRecentSearch(['Maya'], 'maya')).toEqual(['maya']);
  });

  it('returns the same list when the term is already first', () => {
    const list = ['maya'];

    expect(addRecentSearch(list, 'maya')).toBe(list);
  });

  it('keeps only the most recent terms', () => {
    let list: readonly string[] = [];
    for (let index = 0; index < MAX_RECENT_SEARCHES + 3; index += 1) {
      list = addRecentSearch(list, `term ${index}`);
    }

    expect(list).toHaveLength(MAX_RECENT_SEARCHES);
    expect(list[0]).toBe(`term ${MAX_RECENT_SEARCHES + 2}`);
  });
});

describe('removeRecentSearch', () => {
  it('removes a term case-insensitively', () => {
    expect(removeRecentSearch(['Maya', 'leo'], 'maya')).toEqual(['leo']);
  });

  it('returns the same list when the term is absent', () => {
    const list = ['maya'];

    expect(removeRecentSearch(list, 'leo')).toBe(list);
  });
});

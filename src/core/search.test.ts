import {
  countryName,
  languageName,
  normalizeSearchText,
  rankSearchMatches,
  scoreSearchMatch,
  tokenizeSearchQuery,
} from './search';

describe('normalizeSearchText', () => {
  it('folds case, punctuation and spacing', () => {
    expect(normalizeSearchText('  Maya   K. ')).toBe('maya k');
  });

  it('folds Arabic alef, ta marbuta and alef maqsura spellings', () => {
    expect(normalizeSearchText('أحمد')).toBe(normalizeSearchText('احمد'));
    expect(normalizeSearchText('قهوة')).toBe(normalizeSearchText('قهوه'));
    expect(normalizeSearchText('ليلى')).toBe(normalizeSearchText('ليلي'));
  });

  it('drops Arabic diacritics and tatweel', () => {
    expect(normalizeSearchText('مُحَمَّد')).toBe('محمد');
    expect(normalizeSearchText('محـــمد')).toBe('محمد');
  });

  it('folds Latin accents', () => {
    expect(normalizeSearchText('José')).toBe('jose');
  });

  it('reduces punctuation-only input to an empty query', () => {
    expect(normalizeSearchText('  ...  ')).toBe('');
  });
});

describe('tokenizeSearchQuery', () => {
  it('keeps every token and ignores their order', () => {
    expect(tokenizeSearchQuery('K. Maya')).toEqual(['k', 'maya']);
  });
});

describe('scoreSearchMatch', () => {
  const MAYA = {
    name: 'Maya K.',
    strong: ['Saudi Arabia'],
    weak: ['Coffee and playlists.'],
  };

  it('ranks an exact name above a prefix above a phrase mention', () => {
    const exact = scoreSearchMatch('Maya K.', MAYA);
    const prefix = scoreSearchMatch('may', MAYA);
    const weak = scoreSearchMatch('playlists', MAYA);

    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(weak);
    expect(weak).toBeGreaterThan(0);
  });

  it('requires every token to match', () => {
    expect(scoreSearchMatch('maya saudi', MAYA)).toBeGreaterThan(0);
    expect(scoreSearchMatch('maya japan', MAYA)).toBe(0);
  });

  it('finds an Arabic name typed without its hamza', () => {
    expect(scoreSearchMatch('احمد', { name: 'أحمد' })).toBeGreaterThan(0);
  });

  it('matches a country name regardless of case', () => {
    expect(scoreSearchMatch('SAUDI', MAYA)).toBeGreaterThan(0);
  });

  it('returns zero for an empty query rather than matching everything', () => {
    expect(scoreSearchMatch('   ', MAYA)).toBe(0);
  });
});

describe('rankSearchMatches', () => {
  interface Person {
    name: string;
    country: string;
  }

  const fieldsOf = (person: Person) => ({ name: person.name, strong: [person.country] });

  it('drops non-matches', () => {
    const ranked = rankSearchMatches(
      [
        { name: 'Maya K.', country: 'Saudi Arabia' },
        { name: 'Leo', country: 'Germany' },
      ],
      'maya',
      fieldsOf,
    );

    expect(ranked.map((person) => person.name)).toEqual(['Maya K.']);
  });

  it('ranks a name match above a country match', () => {
    const ranked = rankSearchMatches(
      [
        { name: 'Amara', country: 'Saudi Arabia' },
        { name: 'Saud', country: 'Egypt' },
      ],
      'saud',
      fieldsOf,
    );

    expect(ranked.map((person) => person.name)).toEqual(['Saud', 'Amara']);
  });

  it('breaks score ties with the supplied comparator', () => {
    const ranked = rankSearchMatches(
      [
        { name: 'Maya S.', country: 'Egypt' },
        { name: 'Maya K.', country: 'Egypt' },
      ],
      'maya',
      fieldsOf,
      (a, b) => a.name.localeCompare(b.name),
    );

    expect(ranked.map((person) => person.name)).toEqual(['Maya K.', 'Maya S.']);
  });

  it('returns nothing for an empty query', () => {
    expect(rankSearchMatches([{ name: 'Maya', country: 'Egypt' }], '  ', fieldsOf)).toEqual([]);
  });
});

describe('countryName and languageName', () => {
  it('names known locale codes and ignores unknown ones', () => {
    expect(countryName('SA')).toBe('Saudi Arabia');
    expect(countryName('sa')).toBe('Saudi Arabia');
    expect(countryName('ZZ')).toBe('');
    expect(countryName(undefined)).toBe('');
  });

  it('names room languages', () => {
    expect(languageName('ar')).toBe('Arabic');
    expect(languageName('EN')).toBe('English');
    expect(languageName(undefined)).toBe('');
  });
});

import type { PeopleFilterOptions, PeopleFilters, UserSummary } from './data/types';
import {
  applyPeopleFilters,
  countActivePeopleFilters,
  defaultPeopleFilters,
  isDefaultPeopleFilters,
} from './people-filters';

const OPTIONS: PeopleFilterOptions = {
  age: { min: 18, max: 40, step: 1 },
  distanceKm: { min: 0, max: 100, step: 10 },
  countries: [
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'GB', label: 'United Kingdom' },
  ],
  languages: [
    { value: 'ar', label: 'Arabic' },
    { value: 'en', label: 'English' },
  ],
};

function user(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    displayName: 'Test Member',
    status: 'Hello',
    badges: [],
    isOnline: true,
    age: 25,
    gender: 'female',
    distanceKm: 20,
    locale: 'SA',
    language: 'ar',
    ...overrides,
  };
}

function filters(overrides: Partial<PeopleFilters> = {}): PeopleFilters {
  return { ...defaultPeopleFilters(OPTIONS), ...overrides };
}

describe('defaultPeopleFilters', () => {
  it('uses the data bounds and no facet', () => {
    expect(defaultPeopleFilters(OPTIONS)).toEqual({
      gender: null,
      ageMin: 18,
      ageMax: 40,
      distanceMinKm: 0,
      distanceMaxKm: 100,
      onlineOnly: false,
      country: null,
      language: null,
    });
  });
});

describe('countActivePeopleFilters', () => {
  it('counts each narrowed facet once', () => {
    const active = filters({
      gender: 'male',
      ageMin: 20,
      distanceMaxKm: 50,
      onlineOnly: true,
      country: 'SA',
      language: 'ar',
    });

    expect(countActivePeopleFilters(active, OPTIONS)).toBe(6);
  });

  it('does not count full-range age or distance sliders', () => {
    expect(countActivePeopleFilters(filters(), OPTIONS)).toBe(0);
    expect(isDefaultPeopleFilters(filters(), OPTIONS)).toBe(true);
  });
});

describe('applyPeopleFilters', () => {
  const users = [
    user({ id: 'female-sa-ar', gender: 'female', locale: 'SA', language: 'ar' }),
    user({
      id: 'male-gb-en',
      gender: 'male',
      locale: 'GB',
      language: 'en',
      age: 35,
      distanceKm: 70,
      isOnline: false,
    }),
    user({ id: 'unknown-age', age: undefined, gender: 'male', distanceKm: undefined }),
  ];

  it('returns everyone at the defaults', () => {
    expect(applyPeopleFilters(users, filters(), OPTIONS)).toHaveLength(3);
  });

  it('filters by gender', () => {
    const result = applyPeopleFilters(users, filters({ gender: 'male' }), OPTIONS);

    expect(result.map((entry) => entry.id)).toEqual(['male-gb-en', 'unknown-age']);
  });

  it('enforces a narrowed age range and excludes unknown ages', () => {
    const result = applyPeopleFilters(users, filters({ ageMin: 30 }), OPTIONS);

    expect(result.map((entry) => entry.id)).toEqual(['male-gb-en']);
  });

  it('includes unknown ages when the range is the full data range', () => {
    const result = applyPeopleFilters(users, filters({ ageMin: 18, ageMax: 40 }), OPTIONS);

    expect(result).toHaveLength(3);
  });

  it('enforces a narrowed distance range and excludes unknown distances', () => {
    const result = applyPeopleFilters(users, filters({ distanceMaxKm: 50 }), OPTIONS);

    expect(result.map((entry) => entry.id)).toEqual(['female-sa-ar']);
  });

  it('filters by online state', () => {
    const result = applyPeopleFilters(users, filters({ onlineOnly: true }), OPTIONS);

    expect(result.every((entry) => entry.isOnline)).toBe(true);
  });

  it('matches country and language case-insensitively', () => {
    const result = applyPeopleFilters(users, filters({ country: 'gb', language: 'EN' }), OPTIONS);

    expect(result.map((entry) => entry.id)).toEqual(['male-gb-en']);
  });

  it('can produce an empty list rather than inventing a match', () => {
    const result = applyPeopleFilters(users, filters({ distanceMaxKm: 0 }), OPTIONS);

    expect(result).toEqual([]);
  });
});

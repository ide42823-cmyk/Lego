import type { PeopleFilterOptions, PeopleFilters, UserSummary } from './data/types';

/**
 * People-directory filtering.
 *
 * The rules live here rather than in the screen so the same filter can be
 * applied to a fixture page in tests and, later, translated into the server's
 * query. The screen owns the draft/committed state; this module owns the
 * meaning of "everyone".
 */

/** The neutral filter for the current data: no facet narrowed. */
export function defaultPeopleFilters(options: PeopleFilterOptions): PeopleFilters {
  return {
    gender: null,
    ageMin: options.age.min,
    ageMax: options.age.max,
    distanceMinKm: options.distanceKm.min,
    distanceMaxKm: options.distanceKm.max,
    onlineOnly: false,
    country: null,
    language: null,
  };
}

/**
 * How many facets are narrowed. Age and distance only count when their bounds
 * are narrower than the data's full bounds; a full-range slider is "any".
 */
export function countActivePeopleFilters(
  filters: PeopleFilters,
  options: PeopleFilterOptions,
): number {
  let count = 0;

  if (filters.gender) {
    count += 1;
  }
  if (filters.ageMin > options.age.min || filters.ageMax < options.age.max) {
    count += 1;
  }
  if (
    filters.distanceMinKm > options.distanceKm.min ||
    filters.distanceMaxKm < options.distanceKm.max
  ) {
    count += 1;
  }
  if (filters.onlineOnly) {
    count += 1;
  }
  if (filters.country) {
    count += 1;
  }
  if (filters.language) {
    count += 1;
  }

  return count;
}

export function isDefaultPeopleFilters(
  filters: PeopleFilters,
  options: PeopleFilterOptions,
): boolean {
  return countActivePeopleFilters(filters, options) === 0;
}

/**
 * Applies the filter to one directory page.
 *
 * Age and distance are only enforced when their bounds are narrowed. A member
 * who has not shared an age or a coarse distance is therefore included at the
 * full range, but cannot satisfy a narrowed range — the alternative (silently
 * treating "unknown" as "in range") would make the filter lie.
 */
export function applyPeopleFilters(
  users: readonly UserSummary[],
  filters: PeopleFilters,
  options: PeopleFilterOptions,
): UserSummary[] {
  const ageNarrowed = filters.ageMin > options.age.min || filters.ageMax < options.age.max;
  const distanceNarrowed =
    filters.distanceMinKm > options.distanceKm.min ||
    filters.distanceMaxKm < options.distanceKm.max;
  const country = filters.country?.toLowerCase() ?? null;
  const language = filters.language?.toLowerCase() ?? null;

  return users.filter((user) => {
    if (filters.gender && user.gender !== filters.gender) {
      return false;
    }
    if (
      ageNarrowed &&
      (user.age === undefined || user.age < filters.ageMin || user.age > filters.ageMax)
    ) {
      return false;
    }
    if (
      distanceNarrowed &&
      (user.distanceKm === undefined ||
        user.distanceKm < filters.distanceMinKm ||
        user.distanceKm > filters.distanceMaxKm)
    ) {
      return false;
    }
    if (filters.onlineOnly && !user.isOnline) {
      return false;
    }
    if (country && user.locale?.toLowerCase() !== country) {
      return false;
    }
    if (language && user.language?.toLowerCase() !== language) {
      return false;
    }
    return true;
  });
}

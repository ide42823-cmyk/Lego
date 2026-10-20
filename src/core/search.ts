/**
 * Search matching and ranking.
 *
 * The real API will own search (including its ranking, trending terms and
 * history), but the *shape* of the work — normalise, require every token, rank
 * by field — is the same whether it runs here or on a server. Keeping it in a
 * pure module means the fixtures can exercise it and the UI can be reviewed
 * without pretending a server exists.
 *
 * Two deliberate choices:
 *
 *  1. Matching is token-AND, not substring-of-the-whole-query. "maya k" matches
 *     "Maya K." even though the punctuation differs, and word order does not
 *     matter.
 *  2. Normalisation folds Arabic spelling variants (alef forms, ta marbuta, alef
 *     maqsura, diacritics, tatweel) and Latin accents, so a member typing a name
 *     the way they would on a phone keyboard still finds it.
 */

export interface SearchFieldSet {
  /** The primary label: a member's name or a room's title. */
  name: string;
  /** Descriptive terms: a host, a tag, a country, a category. */
  strong?: readonly string[];
  /** Supporting prose: a status line or a room description. */
  weak?: readonly string[];
}

/** Country names for the coarse locale hint carried by members and rooms. */
const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates',
  DE: 'Germany',
  EG: 'Egypt',
  GB: 'United Kingdom',
  IN: 'India',
  JP: 'Japan',
  MA: 'Morocco',
  SA: 'Saudi Arabia',
  TR: 'Turkey',
  US: 'United States',
};

const LANGUAGE_NAMES: Record<string, string> = {
  ar: 'Arabic',
  en: 'English',
};

/** A display name for a locale code, or an empty string when unknown. */
export function countryName(code?: string): string {
  return code ? (COUNTRY_NAMES[code.toUpperCase()] ?? '') : '';
}

/** A display name for a language code, or an empty string when unknown. */
export function languageName(code?: string): string {
  return code ? (LANGUAGE_NAMES[code.toLowerCase()] ?? '') : '';
}

/**
 * Folds a string into the form both the query and the haystack are compared in.
 *
 * Arabic is folded *before* Unicode decomposition because the precomposed
 * letters (أ, إ, آ) decompose into base letter + mark, and removing the mark
 * alone would lose the spelling variant the member typed.
 */
export function normalizeSearchText(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .normalize('NFD')
      // Latin combining accents plus Arabic harakat, maddah and Quranic marks.
      .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')
      .replace(/\u0640/g, '')
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
  );
}

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  return normalized ? normalized.split(' ') : [];
}

function startsAnyWord(haystack: string, token: string): boolean {
  return haystack.split(' ').some((word) => word.startsWith(token));
}

function scoreToken(token: string, name: string, strong: string[], weak: string[]): number {
  if (name === token) {
    return 100;
  }
  if (name.startsWith(token)) {
    return 80;
  }
  if (startsAnyWord(name, token)) {
    return 70;
  }
  if (name.includes(token)) {
    return 60;
  }
  if (strong.some((value) => value === token)) {
    return 50;
  }
  if (strong.some((value) => startsAnyWord(value, token))) {
    return 45;
  }
  if (strong.some((value) => value.includes(token))) {
    return 40;
  }
  if (weak.some((value) => value.includes(token))) {
    return 20;
  }
  return 0;
}

/**
 * How well `query` describes `fields`. Zero means no match; a bigger number is
 * a better match. Every query token has to hit something, so "maya egypt"
 * only matches a member who is both Maya and Egyptian.
 */
export function scoreSearchMatch(query: string, fields: SearchFieldSet): number {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) {
    return 0;
  }

  const name = normalizeSearchText(fields.name);
  const strong = (fields.strong ?? []).map(normalizeSearchText).filter(Boolean);
  const weak = (fields.weak ?? []).map(normalizeSearchText).filter(Boolean);

  let total = 0;
  for (const token of tokens) {
    const score = scoreToken(token, name, strong, weak);
    if (score === 0) {
      return 0;
    }
    total += score;
  }
  return total;
}

/**
 * Filters out non-matches and orders the rest, best first.
 *
 * `compareTie` decides between equal scores; it is how a room list stays
 * alphabetical within a rank rather than following fixture order.
 */
export function rankSearchMatches<T>(
  items: readonly T[],
  query: string,
  fieldsOf: (item: T) => SearchFieldSet,
  compareTie?: (a: T, b: T) => number,
): T[] {
  const scored: { item: T; score: number }[] = [];

  for (const item of items) {
    const score = scoreSearchMatch(query, fieldsOf(item));
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return compareTie ? compareTie(a.item, b.item) : 0;
  });

  return scored.map((entry) => entry.item);
}

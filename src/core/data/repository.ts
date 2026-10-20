/**
 * Data access seam.
 *
 * Every screen talks to this interface, never to fixtures directly. When the
 * real backend lands, only this module changes — the screens keep working.
 *
 * Nothing here is authoritative. Balances, entitlements, gift eligibility and
 * relationship state must come from the server; these fixtures exist purely to
 * build and review the UI.
 */

import { countryName, languageName, rankSearchMatches, type SearchFieldSet } from '@/core/search';
import { ROOM_CATEGORY_LABELS } from '@/core/room-labels';

import {
  FIXTURE_BANNERS,
  FIXTURE_CONVERSATIONS,
  FIXTURE_ME,
  FIXTURE_MOMENTS,
  FIXTURE_PROFILES,
  FIXTURE_ROOMS,
  FIXTURE_USERS,
} from './fixtures';
import type {
  ContactsFilter,
  ConversationFilter,
  ConversationSummary,
  DirectoryFeedItem,
  MeDashboard,
  MomentPost,
  MomentsMode,
  Page,
  PeopleMode,
  RoomCategory,
  RoomFeedItem,
  RoomMode,
  RoomRelationshipFilter,
  RoomSummary,
  SearchPage,
  SearchSuggestions,
  UserProfile,
  UserSummary,
} from './types';

export interface PageRequest {
  cursor?: string | null;
  limit?: number;
}

export interface SearchRequest extends PageRequest {
  /**
   * Restrict a room search to one directory category. The Families tab uses
   * this to search the family rooms without a second entity type.
   */
  category?: RoomCategory;
}

export interface DataSource {
  listPeople(mode: PeopleMode, request?: PageRequest): Promise<Page<DirectoryFeedItem>>;
  listRooms(
    mode: RoomMode,
    options?: PageRequest & { relationship?: RoomRelationshipFilter },
  ): Promise<Page<RoomFeedItem>>;
  listConversations(
    filter: ConversationFilter,
    request?: PageRequest,
  ): Promise<Page<ConversationSummary>>;
  listContacts(filter: ContactsFilter, request?: PageRequest): Promise<Page<UserSummary>>;
  listMoments(mode: MomentsMode, request?: PageRequest): Promise<Page<MomentPost>>;
  /**
   * Text search over the people directory. Matching and ranking live behind
   * this seam; the screen only renders the page and its total.
   */
  searchPeople(query: string, request?: PageRequest): Promise<SearchPage<UserSummary>>;
  /** Text search over the room directory. */
  searchRooms(query: string, request?: SearchRequest): Promise<SearchPage<RoomSummary>>;
  /** Terms offered before the member types. Server-owned in the real build. */
  getSearchSuggestions(): Promise<SearchSuggestions>;
  getMe(): Promise<MeDashboard>;
  /** One member's public profile. Rejects for an unknown id. */
  getProfile(userId: string): Promise<UserProfile>;
  /**
   * Sends a greeting. Returns the *confirmed* state, which the UI reconciles to —
   * the same contract as `setMomentLiked`. A client never decides on its own that
   * a greeting landed.
   */
  sendGreeting(userId: string): Promise<{ greeted: boolean }>;
  /** Returns the server-confirmed like state. Optimistic UI must reconcile to it. */
  setMomentLiked(
    momentId: string,
    liked: boolean,
  ): Promise<{ likeCount: number; likedByMe: boolean }>;
}

/**
 * Development-only knobs used to review loading/error states without a backend.
 * Tests set `latencyMs` to 0. Never read by product code.
 */
export const devControls = {
  latencyMs: 450,
  /** When > 0, that many subsequent reads reject. Decremented per failure. */
  failReads: 0,
};

/**
 * Stands in for the greeting table on the server. Reset never happens, which is
 * deliberate: sending a greeting twice must be idempotent, exactly as it will be
 * against the real API.
 */
const GREETED = new Set<string>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function simulate<T>(produce: () => T): Promise<T> {
  if (devControls.latencyMs > 0) {
    await delay(devControls.latencyMs);
  }
  if (devControls.failReads > 0) {
    devControls.failReads -= 1;
    throw new Error('Simulated network failure');
  }
  return produce();
}

function paginate<T>(items: readonly T[], request: PageRequest = {}): Page<T> {
  const limit = request.limit ?? 12;
  const offset = request.cursor ? Number(request.cursor) : 0;
  const start = Number.isFinite(offset) && offset > 0 ? offset : 0;
  const slice = items.slice(start, start + limit);
  const next = start + limit < items.length ? String(start + limit) : null;
  return { items: slice, nextCursor: next };
}

/** A search page also carries the full match count, not just the slice. */
function paginateSearch<T>(items: readonly T[], request: PageRequest = {}): SearchPage<T> {
  return { ...paginate(items, request), total: items.length };
}

/**
 * What a people search looks at.
 *
 * The display name outranks everything. A country name is a strong term so
 * "Saudi" is a useful query; the status line is weak, so a member whose bio
 * mentions "coffee" ranks below one called Coffee.
 */
function userSearchFields(user: UserSummary): SearchFieldSet {
  return {
    name: user.displayName,
    strong: [countryName(user.locale)],
    weak: [user.status],
  };
}

/**
 * What a room search looks at. Category and tag labels are the same strings the
 * card prints, so searching a visible chip always finds that room.
 */
function roomSearchFields(room: RoomSummary): SearchFieldSet {
  return {
    name: room.name,
    strong: [
      room.hostName,
      ROOM_CATEGORY_LABELS[room.category],
      // The visible label is plural ("Families"), but members also type the
      // singular. Both are strong terms for family rooms.
      ...(room.category === 'families' ? ['Family'] : []),
      countryName(room.country),
      languageName(room.language),
      ...room.tags,
    ],
    weak: [room.description],
  };
}

/** Countries that actually occur in the people fixtures, in a stable order. */
function suggestedCountries(): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const user of FIXTURE_USERS) {
    const term = countryName(user.locale);
    if (term && !seen.has(term)) {
      seen.add(term);
      terms.push(term);
    }
  }

  return terms.slice(0, 8);
}

/** Visible room chips: topics first, then categories. */
function suggestedRoomTerms(): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const room of FIXTURE_ROOMS) {
    for (const tag of room.tags) {
      if (!seen.has(tag)) {
        seen.add(tag);
        terms.push(tag);
      }
    }
  }

  const tags = terms.slice(0, 6);
  for (const label of Object.values(ROOM_CATEGORY_LABELS)) {
    if (!tags.includes(label)) {
      tags.push(label);
    }
  }
  return tags;
}

/**
 * Family-room names. The Families tab is a room directory, so the most useful
 * chips are the rooms themselves; every chip is guaranteed to have a result.
 */
function suggestedFamilyTerms(): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const room of FIXTURE_ROOMS) {
    if (room.category !== 'families' || seen.has(room.name)) {
      continue;
    }
    seen.add(room.name);
    names.push(room.name);
  }

  return names.slice(0, 6);
}

/** Interleaves promotional banners into a people list. */
function withBanners(users: readonly UserSummary[]): DirectoryFeedItem[] {
  const feed: DirectoryFeedItem[] = [];
  let bannerIndex = 0;
  users.forEach((user, index) => {
    feed.push({ kind: 'user', id: user.id, user });
    const isSlot = (index + 1) % 5 === 0;
    if (isSlot && bannerIndex < FIXTURE_BANNERS.length) {
      const banner = FIXTURE_BANNERS[bannerIndex] as (typeof FIXTURE_BANNERS)[number];
      feed.push({ kind: 'banner', id: banner.id, banner });
      bannerIndex += 1;
    }
  });
  return feed;
}

/**
 * Puts the directory's promotion at the head of the room feed.
 *
 * The reference shows an event card above a room directory (and above the video
 * grid) rather than between rooms, so it leads the feed and pagination keeps it
 * on the first page.
 */
function withRoomBanner(rooms: readonly RoomSummary[]): RoomFeedItem[] {
  const feed: RoomFeedItem[] = rooms.map((room) => ({ kind: 'room', id: room.id, room }));
  const banner = FIXTURE_BANNERS[0];
  if (!banner) {
    return feed;
  }
  return [{ kind: 'banner', id: banner.id, banner }, ...feed];
}

function selectPeople(mode: PeopleMode): UserSummary[] {
  switch (mode) {
    case 'nearby':
      // Nearby re-buckets by rank order so the list is genuinely closest-first.
      // Buckets stay coarse and are never a precise position.
      return FIXTURE_USERS.slice(0, 14).map((user, index) => ({
        ...user,
        distanceKm: (index + 1) * 3,
      }));
    case 'new':
      return [...FIXTURE_USERS].reverse().slice(0, 16);
    case 'featured':
      return FIXTURE_USERS.filter((user) => user.level !== undefined && user.level > 30);
    case 'recommend':
    default:
      return [...FIXTURE_USERS].sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
  }
}

function selectRooms(
  mode: RoomMode,
  relationship: RoomRelationshipFilter = 'joined',
): RoomSummary[] {
  switch (mode) {
    case 'video':
      return FIXTURE_ROOMS.filter((room) => room.category === 'video');
    case 'new':
      return [...FIXTURE_ROOMS].reverse();
    case 'global':
      return [...FIXTURE_ROOMS].sort((a, b) => (a.country ?? '').localeCompare(b.country ?? ''));
    case 'me':
      // Relationship filters are independent of the discovery mode.
      switch (relationship) {
        case 'following':
          return FIXTURE_ROOMS.filter((_, index) => index % 3 === 0);
        case 'recents':
          return FIXTURE_ROOMS.slice(0, 3);
        case 'joined':
        default:
          return FIXTURE_ROOMS.slice(0, 2);
      }
    case 'recommend':
    default:
      return [...FIXTURE_ROOMS].sort((a, b) => b.participantCount - a.participantCount);
  }
}

function selectConversations(filter: ConversationFilter): ConversationSummary[] {
  switch (filter) {
    case 'online':
      return FIXTURE_CONVERSATIONS.filter((conversation) => conversation.isOnline);
    case 'unread':
      return FIXTURE_CONVERSATIONS.filter((conversation) => conversation.unreadCount > 0);
    case 'most_chatted':
      return [...FIXTURE_CONVERSATIONS].sort((a, b) => b.unreadCount - a.unreadCount);
    case 'all':
    default:
      return [...FIXTURE_CONVERSATIONS];
  }
}

export const fixtureDataSource: DataSource = {
  listPeople(mode, request) {
    return simulate(() => paginate(withBanners(selectPeople(mode)), request));
  },

  listRooms(mode, options) {
    const { relationship, ...request } = options ?? {};
    return simulate(() => paginate(withRoomBanner(selectRooms(mode, relationship)), request));
  },

  listConversations(filter, request) {
    return simulate(() => paginate(selectConversations(filter), request));
  },

  listContacts(filter, request) {
    // No relationship graph exists yet; each filter is a stable slice so the
    // UI can be reviewed against real row counts.
    const offset = filter === 'friends' ? 4 : filter === 'followers' ? 9 : 0;
    const users = [...FIXTURE_USERS.slice(offset), ...FIXTURE_USERS.slice(0, offset)];
    return simulate(() => paginate(users.slice(0, 18), request));
  },

  listMoments(mode, request) {
    const items = mode === 'new' ? [...FIXTURE_MOMENTS].reverse() : [...FIXTURE_MOMENTS];
    return simulate(() => paginate(items, request));
  },

  searchPeople(query, request) {
    return simulate(() => {
      const matches = rankSearchMatches(FIXTURE_USERS, query, userSearchFields, (a, b) =>
        a.displayName.localeCompare(b.displayName),
      );
      return paginateSearch(matches, request);
    });
  },

  searchRooms(query, request) {
    return simulate(() => {
      const category = request?.category;
      const rooms = category
        ? FIXTURE_ROOMS.filter((room) => room.category === category)
        : FIXTURE_ROOMS;
      const matches = rankSearchMatches(rooms, query, roomSearchFields, (a, b) =>
        a.name.localeCompare(b.name),
      );
      return paginateSearch(matches, request);
    });
  },

  getSearchSuggestions() {
    return simulate(() => ({
      people: suggestedCountries(),
      rooms: suggestedRoomTerms(),
      families: suggestedFamilyTerms(),
    }));
  },

  getMe() {
    return simulate(() => ({ ...FIXTURE_ME }));
  },

  getProfile(userId) {
    return simulate(() => {
      const profile = FIXTURE_PROFILES.find((item) => item.id === userId);
      if (!profile) {
        throw new Error(`Unknown member: ${userId}`);
      }
      // Shallow copy. The nested posts stay the *same* objects the Moments feed
      // renders, so a like confirmed in one surface is visible in the other.
      return { ...profile };
    });
  },

  sendGreeting(userId) {
    return simulate(() => {
      if (!FIXTURE_USERS.some((user) => user.id === userId)) {
        throw new Error(`Unknown member: ${userId}`);
      }
      GREETED.add(userId);
      return { greeted: true };
    });
  },

  setMomentLiked(momentId, liked) {
    return simulate(() => {
      const moment = FIXTURE_MOMENTS.find((item) => item.id === momentId);
      if (!moment) {
        throw new Error(`Unknown moment: ${momentId}`);
      }
      // Mirrors what a server would return as the confirmed state.
      const delta = liked === moment.likedByMe ? 0 : liked ? 1 : -1;
      moment.likedByMe = liked;
      moment.likeCount = Math.max(0, moment.likeCount + delta);
      return { likeCount: moment.likeCount, likedByMe: moment.likedByMe };
    });
  },
};

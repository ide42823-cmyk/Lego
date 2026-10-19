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
  RoomFeedItem,
  RoomMode,
  RoomRelationshipFilter,
  RoomSummary,
  UserProfile,
  UserSummary,
} from './types';

export interface PageRequest {
  cursor?: string | null;
  limit?: number;
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

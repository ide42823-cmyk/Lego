/**
 * Domain types shared by the data layer and the UI.
 *
 * Rules:
 *   - Route params carry stable IDs only; whole objects are looked up by ID.
 *   - Money/entitlement fields are *presentation* only. The server is the source
 *     of truth for balances, prices and tier entitlements.
 *   - Image URLs are optional. When absent the UI renders a deterministic local
 *     placeholder, so nothing depends on an external image host.
 */

export type PeopleMode = 'recommend' | 'nearby' | 'new' | 'featured';
export type MomentsMode = 'recommend' | 'new';
export type RoomMode = 'recommend' | 'video' | 'new' | 'me' | 'global';
export type RoomRelationshipFilter = 'joined' | 'following' | 'recents';
export type ConversationFilter = 'all' | 'online' | 'most_chatted' | 'unread';
export type ContactsFilter = 'following' | 'friends' | 'followers';
export type MessagesTab = 'messages' | 'contacts';
export type RoomCategory = 'chat' | 'families' | 'friendship' | 'video';
export type RoomBadge = 'official' | 'featured' | 'trending';
export type Gender = 'female' | 'male';

export type UserBadge = 'level' | 'vip' | 'svip' | 'aristocracy' | 'verified' | 'new';

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Short status/bio line. */
  status: string;
  /** Country/locale hint. Never a precise location. */
  locale?: string;
  /**
   * Bucketed distance in km, only on the Nearby directory. Deliberately coarse:
   * the product must not leak precise location.
   */
  distanceKm?: number;
  level?: number;
  /** Age in years, when the member has chosen to display it. */
  age?: number;
  gender?: Gender;
  /** Paid rank number, e.g. 2 renders as "VIP2". Absent for non-members. */
  vipTier?: number;
  /** The member advertises video calls straight from the directory row. */
  videoCall?: boolean;
  badges: UserBadge[];
  isOnline: boolean;
}

export interface RoomSummary {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  hostName: string;
  hostLevel: number;
  category: RoomCategory;
  participantCount: number;
  country?: string;
  language?: string;
  /** Editorial tags rendered as tinted chips next to the category. */
  badges?: RoomBadge[];
  tags: string[];
}

export interface ConversationSummary {
  id: string;
  peerId: string;
  peerName: string;
  avatarUrl?: string;
  /** Country hint, shown as a flag beside the name in the inbox. */
  locale?: string;
  snippet: string;
  /** ISO-8601. Formatting happens in the UI layer. */
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface MomentPost {
  id: string;
  authorId: string;
  authorName: string;
  /**
   * Mirrors the author's level in the discovery directories. Optional like
   * `UserSummary.level`: when it is absent the level badge is omitted rather
   * than rendered as "Lv 0".
   */
  authorLevel?: number;
  /** Author's age/gender, shown as the pill under their name. */
  authorAge?: number;
  authorGender?: Gender;
  avatarUrl?: string;
  badges: UserBadge[];
  text: string;
  mediaUrl?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel: string;
}

/** A directory feed interleaves promo banners with user rows. */
export type DirectoryFeedItem =
  | { kind: 'user'; id: string; user: UserSummary }
  | { kind: 'banner'; id: string; banner: PromoBanner };

/**
 * A room feed carries the same promotion shape as a people feed.
 *
 * The reference puts the promotion *above* a room directory rather than between
 * rooms, so today it is the first entry — but it stays a feed item so a surface
 * that wants to interleave one does not need a second type.
 */
export type RoomFeedItem =
  | { kind: 'room'; id: string; room: RoomSummary }
  | { kind: 'banner'; id: string; banner: PromoBanner };

export interface MembershipSummary {
  id: 'vip' | 'svip' | 'aristocracy';
  label: string;
  status: 'active' | 'available' | 'expiring';
  /** Presentation copy only — never an entitlement decision. */
  detail: string;
}

export interface MeDashboard {
  userId: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  followingCount: number;
  friendCount: number;
  followersCount: number;
  /**
   * Presentation only. The real balance is server-authoritative and this number
   * must never be adjusted locally — see the wallet rules in the architecture
   * notes.
   */
  coinBalance: number;
  memberships: MembershipSummary[];
  /**
   * Things on this screen that want attention — a pending task, a new visitor.
   * Drives the dot on the account tab. It is a count, never an entitlement.
   */
  notificationCount: number;
}

export interface Page<T> {
  items: T[];
  /** Cursor for the next page; null when the list is exhausted. */
  nextCursor: string | null;
}

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
export type ConversationFilter = 'all' | 'online' | 'most_chatted' | 'unread' | 'favorites';
export type ContactsFilter = 'following' | 'friends' | 'followers';
export type MessagesTab = 'messages' | 'contacts';
/**
 * Search covers the two entity kinds the app has directories for. "Families"
 * is a view of the room directory restricted to family rooms, not a separate
 * family entity (the app has none yet).
 */
export type SearchMode = 'people' | 'rooms' | 'families';
export type RoomCategory = 'chat' | 'families' | 'friendship' | 'video';
export type RoomBadge = 'official' | 'featured' | 'trending';
export type Gender = 'female' | 'male';

/**
 * A decorative avatar frame a member owns.
 *
 * The keys are meanings, not file names: the view resolves them against its own
 * art set (`core/media/images`), so the art can be replaced without touching the
 * data layer. Ownership is a server fact; nothing here grants it.
 *
 * `halo` is the one animated frame, so it is only ever drawn on a single avatar
 * at a time — never inside a list.
 */
export type AvatarFrameKey = 'blossom' | 'wings' | 'heart' | 'rope' | 'halo';

export type UserBadge = 'level' | 'vip' | 'svip' | 'aristocracy' | 'verified' | 'new';

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Short status/bio line. */
  status: string;
  /** Country/locale hint. Never a precise location. */
  locale?: string;
  /** App/interface language code, e.g. "ar" or "en". */
  language?: string;
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
  /** The avatar frame this member owns, when they have one. */
  avatarFrame?: AvatarFrameKey;
  badges: UserBadge[];
  isOnline: boolean;
}

/** One choice in a filter picker. `value` is the stored code, `label` is shown. */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * The facets a people filter can offer, derived from the directory behind the
 * data seam. Bounds are the current data's bounds, so a full-range slider is
 * genuinely "everyone" rather than an invented 18-80 scale.
 */
export interface PeopleFilterOptions {
  age: { min: number; max: number; step: number };
  distanceKm: { min: number; max: number; step: number };
  countries: FilterOption[];
  languages: FilterOption[];
}

/**
 * A people filter draft/committed value. `null` in a nullable field means "any";
 * the full age/distance bounds also mean "any".
 */
export interface PeopleFilters {
  gender: Gender | null;
  ageMin: number;
  ageMax: number;
  distanceMinKm: number;
  distanceMaxKm: number;
  onlineOnly: boolean;
  /** Locale code, e.g. "SA". */
  country: string | null;
  /** Language code, e.g. "ar". */
  language: string | null;
}

/**
 * The leaderboards the ranking screen can show. `games` and `family` are real
 * product categories but have no standings yet; the data layer reports that
 * explicitly rather than inventing rows.
 */
export type LeaderboardCategory = 'charm' | 'wealth' | 'newcomer' | 'room' | 'games' | 'family';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * One row on a leaderboard.
 *
 * The ranking key and the printed value are separate on purpose. A server will
 * eventually own both; the screen only formats `valueLabel` and never derives a
 * position from client state.
 */
export interface LeaderboardEntry {
  id: string;
  kind: 'member' | 'room';
  name: string;
  /** Portrait for a member, cover for a room. */
  avatarUrl?: string;
  avatarFrame?: AvatarFrameKey;
  /** Country/locale hint for the flag and subtitle. */
  locale?: string;
  level?: number;
  vipTier?: number;
  badges?: readonly UserBadge[];
  isOnline?: boolean;
  /** Short supporting line, e.g. "Saudi Arabia" or "Host · Maya". */
  subtitle?: string;
  /** 1-based position in the board. */
  rank: number;
  /** Sort key from the data source. Higher is better for every board. */
  score: number;
  /** Already formatted for display, e.g. "12.4k" or "Today". */
  valueLabel: string;
}

export interface Leaderboard {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  /** Ordered by `rank`; the screen renders the first three on the podium. */
  entries: LeaderboardEntry[];
  /**
   * Every region represented on the *unfiltered* board, sorted by label. The
   * screen offers these in its region picker; an unavailable board has none.
   */
  regions: FilterOption[];
  /** The applied alpha-2 region code, or null when the board is not filtered. */
  region: string | null;
  /**
   * Set when the category has no real standings yet. The screen renders this
   * copy instead of a table, so an empty board is never mistaken for zero data.
   */
  unavailable?: { title: string; message: string };
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
  /** The peer's avatar frame, mirroring their directory entry. */
  avatarFrame?: AvatarFrameKey;
  /** Country hint, shown as a flag beside the name in the inbox. */
  locale?: string;
  snippet: string;
  /** ISO-8601. Formatting happens in the UI layer. */
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
  /** The viewer starred this chat; the favourites inbox tab builds on it. */
  isFavorite: boolean;
}

export interface MomentPost {
  id: string;
  authorId: string;
  authorName: string;
  /** Paid rank, rendered as the tier chip under the author's name. */
  authorVipTier?: number;
  /**
   * One topic tag. The reference draws it as a `#` pill beneath the post, so it
   * is a single label rather than a full tag list.
   */
  hashtag?: string;
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
  /** The author's avatar frame, mirroring their directory entry. */
  avatarFrame?: AvatarFrameKey;
  badges: UserBadge[];
  text: string;
  mediaUrl?: string;
  /**
   * Whether the post carries media. Kept separate from `mediaUrl` so fixtures
   * can exercise the media layout without an image host, exactly as the
   * directories do for covers.
   */
  hasMedia?: boolean;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

/** Which original gradient plate a promotion is painted on. */
export type PromoTone = 'families' | 'event' | 'recharge';

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel: string;
  /** Presentation only; the campaign itself is server-owned. */
  tone?: PromoTone;
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
  /** Presentation copy only - never an entitlement decision. */
  detail: string;
}

/** The four shortcuts in the Me screen's General Tools card. */
export type MeToolKey = 'diamonds' | 'visitors' | 'tasks' | 'family';

export interface MeTool {
  key: MeToolKey;
  label: string;
  /**
   * Visitors shows the newest visitor's photo instead of a glyph, as in the
   * reference. The photo is display-only; who may see it is a server decision.
   */
  avatarUrl?: string;
  /** Unactioned count drawn on the tile's corner. */
  badgeCount?: number;
}

/** A mini-game tile. `kind` is a meaning; the screen owns the glyph. */
export interface MeGame {
  id: string;
  title: string;
  kind: 'spin' | 'quiz' | 'board';
  /** Red dot: something new inside. */
  badgeCount?: number;
  /** Small ribbon in the cover's corner, e.g. the player's best level. */
  tag?: string;
}

export type MeMenuKey =
  'events' | 'store' | 'backpack' | 'level' | 'share' | 'support' | 'settings';

export interface MeMenuEntry {
  key: MeMenuKey;
  label: string;
  /** Trailing value, e.g. unclaimed level points. */
  value?: string;
  /** Draws the value as an attention chip rather than plain text. */
  attention?: boolean;
}

export interface MeDashboard {
  userId: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  /** This account's own frame. The only place the animated one is drawn. */
  avatarFrame?: AvatarFrameKey;
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
  /** General Tools shortcuts, in display order. */
  tools: MeTool[];
  /** Games row. Three tiles fit the reference's row. */
  games: MeGame[];
  /** The account menu, in display order. */
  menu: MeMenuEntry[];
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
  /**
   * Total matches across every page, when the endpoint reports one. Directory
   * feeds omit it; a search endpoint uses it to print "12 people" while only
   * the first page is loaded.
   */
  total?: number;
}

/** A search page always knows how many matches exist in total. */
export interface SearchPage<T> extends Page<T> {
  total: number;
}

/**
 * Terms offered before the member has typed anything.
 *
 * The real implementation is server-owned (trending searches for the member's
 * region and language); until then the fixture derives them from the data it
 * already has, so a suggestion can never point at nothing.
 */
export interface SearchSuggestions {
  people: string[];
  rooms: string[];
  /** Family-room names, for the Families tab. */
  families: string[];
}

/* -------------------------------------------------------------------------
 * Public profile (reference screens 001, 018, 021–028)
 *
 * The icon-ish fields below are *meanings*, not icon names. Keeping them out of
 * the icon seam means this module stays dependency-free and the glyph set can
 * change without touching the data layer.
 * ---------------------------------------------------------------------- */

/** An interest/hobby pill. The emoji is decoration; the label carries meaning. */
export interface ProfileTag {
  emoji: string;
  label: string;
}

/**
 * A profile shortcut tile — the member's room or family.
 *
 * `tone` is a role, not a colour: the component decides how a room tile and a
 * family tile should read, and the theme owns the actual values.
 */
export interface ProfileShortcut {
  kind: 'room' | 'family';
  /** Entity id; the tile deep-links to it. */
  id: string;
  label: string;
  memberCount: number;
  tone: 'room' | 'family';
  /** Families can be official; the reference prints a check beside the title. */
  verified?: boolean;
}

/**
 * One photo on the member's cover strip.
 *
 * Fixtures carry no image host, so `id` alone lets the UI render a deterministic
 * placeholder — the same rule the directories follow for avatars.
 */
export interface ProfilePhoto {
  id: string;
  imageUrl?: string;
}

/**
 * The decorative crest the reference floats beside the display name. It is an
 * owned presentation item, never an entitlement decision.
 */
export interface ProfileEmblem {
  /** Glyph meaning; the view resolves it against its own art set. */
  art: HonorArt;
  label: string;
}

export type ProfileInfoIcon =
  | 'mutual'
  | 'id'
  | 'height'
  | 'weight'
  | 'occupation'
  | 'nationality'
  | 'address'
  | 'birthday'
  | 'constellation'
  | 'registered';

export interface ProfileInfoRow {
  key: string;
  icon: ProfileInfoIcon;
  /**
   * One complete line of copy, e.g. "Height 165cm" or "You're now mutual
   * followers". The reference renders label and value as a single run beside the
   * icon, so they are stored as one string rather than reassembled in the view.
   * Never contains a precise location.
   */
  text: string;
  /** Offers copy-to-clipboard. Only ever set for a non-sensitive identifier. */
  copyable?: boolean;
  /** The value written to the clipboard when `copyable` is set. */
  copyValue?: string;
}

/** Decorative art for an honour entry, resolved to a glyph by the UI. */
export type HonorArt = 'crown' | 'star' | 'shield' | 'trophy' | 'gem' | 'sparkle' | 'rank' | 'gift';

export interface HonorEntry {
  id: string;
  label: string;
  art: HonorArt;
  /** Grade letter badge (S/A/B) where the reference shows one. */
  grade?: string;
  /** Rarity tag, e.g. "Rare". */
  rarity?: string;
}

/**
 * One collection on the Honour tab (reference screen 025).
 *
 * There are always three walls even when a collection is empty — the reference
 * keeps the wall's framing and shows placeholder slots rather than collapsing
 * the section.
 */
export interface HonorWall {
  key: 'badges' | 'titles' | 'gifts';
  title: string;
  /** Total in the full collection; the wall only previews a few. */
  count: number;
  entries: HonorEntry[];
  /** Number of empty placeholder slots to draw after the entries. */
  emptySlots?: number;
}

export interface RelationshipRecord {
  id: string;
  kind: 'couple' | 'friend';
  peerId: string;
  peerName: string;
  /** The peer's photo; the card shows the same face the directories show. */
  peerAvatarUrl?: string;
  /** The peer's frame, so a friend card matches the same member elsewhere. */
  peerFrame?: AvatarFrameKey;
  /** Relationship level, e.g. 34 renders as "Couple Lv.34". */
  level: number;
  /** Days the relationship has lasted. */
  days: number;
}

/**
 * Everything the public profile screen renders.
 *
 * Compliance note: `following`/`mutual`/relationship records are read-only
 * presentation here. Whether two members are actually linked is a server fact,
 * and no screen may derive it locally.
 */
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** The frame this member displays; the profile hero and compact bar share it. */
  avatarFrame?: AvatarFrameKey;
  coverUrl?: string;
  /** Short status/bio line, also used for the accessible name. */
  status: string;
  /** Last activity, ISO-8601. The header prints it as "59 minutes ago". */
  lastActiveAt: string;
  age?: number;
  gender?: Gender;
  level?: number;
  vipTier?: number;
  badges: UserBadge[];
  isOnline: boolean;
  /** Family crest label shown last in the chip row, when the member has one. */
  familyName?: string;

  /** Cover thumbnails. The first one doubles as the avatar. */
  photos?: ProfilePhoto[];
  /**
   * Charm (gem) and wealth (star) progress, printed as chips beside the age
   * pill. Presentation only — the real values live on the member's account.
   */
  charmLevel?: number;
  wealthLevel?: number;
  /** Agency badge, e.g. rank 5 of "NUMBER ONE". */
  agency?: { rank: number; name: string };
  /** Decorative crest rendered beside the display name. */
  emblem?: ProfileEmblem;

  /** Free-text signature above the information rows. */
  signature: string;
  tags: ProfileTag[];
  /** Absent when the member does not hold a room. */
  roomShortcut?: ProfileShortcut;
  familyShortcut?: ProfileShortcut;
  info: ProfileInfoRow[];
  honor: HonorWall[];
  /** Posts shown on the Profile > Moments tab. */
  moments: MomentPost[];
  /** Total post count; the tab label prints it. Kept separate from the page. */
  momentCount: number;
  /** Absent for members with no couple. */
  couple?: RelationshipRecord;
  friends: RelationshipRecord[];

  following: boolean;
  mutual: boolean;
}

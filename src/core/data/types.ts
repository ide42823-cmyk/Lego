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

/** A voice seat is an open slot, a locked slot, or an occupied slot. */
export type RoomSeatStatus = 'open' | 'locked' | 'occupied';

export interface RoomSeat {
  /** 1-based position; the reference numbers seats 1–10 in two rows of five. */
  index: number;
  status: RoomSeatStatus;
  /** Portrait of the seated member — `occupied` only. */
  avatarUrl?: string;
  avatarFrame?: AvatarFrameKey;
  /** Gift coins contributed from this seat. Display-only; the ledger is server-owned. */
  contribution: number;
}

/** A notice inside the room's chat overlay. */
export type RoomFeedKind = 'welcome' | 'introduction' | 'event';

export interface RoomFeedNotice {
  id: string;
  kind: RoomFeedKind;
  /** Event notices carry their headline; welcome and introduction do not. */
  title?: string;
  text: string;
  /** The pinned event card's remaining time, already formatted server-side. */
  countdownLabel?: string;
  artUrl?: string;
}

export interface RoomHost {
  id: string;
  displayName: string;
  /** The `ID: …` tag from the reference header. Show format, not identity math. */
  idLabel: string;
  avatarUrl?: string;
  level: number;
}

/** A detail-sheet member wears a service badge or none. */
export type RoomMemberBadge = 'mic' | 'headset';

/** The sheet's medal row. The medal art is our own; tone only selects its tint. */
export interface RoomAchievement {
  id: string;
  tone: 'violet' | 'blue';
  tierLabel: string;
  valueLabel: string;
  caption: string;
}

export interface RoomDetailsMember {
  id: string;
  avatarUrl?: string;
  avatarFrame?: AvatarFrameKey;
  badge?: RoomMemberBadge;
}

export interface LiveRoomDetails {
  /** The host's level crest number. */
  level: number;
  /** Fill fraction of the level bar; display-only progress. */
  levelProgress: number;
  achievements: RoomAchievement[];
  members: RoomDetailsMember[];
  /** The info card's standing copy — the room's directory description. */
  info: string;
}

/** The gift panel's category tabs, read visually right-to-left in the reference. */
export type GiftCategoryKey =
  | 'backpack'
  | 'gift'
  | 'lucky'
  | 'event'
  | 'privilege'
  | 'tokens'
  | 'interactive'
  | 'countries'
  | 'customize'
  | 'members';

/**
 * Tile art meanings — our own glyphs stand in for the reference's proprietary
 * illustrations. The panel maps each meaning to a Lucide glyph.
 */
export type GiftArt =
  | 'mic'
  | 'crown'
  | 'star'
  | 'bell'
  | 'heart'
  | 'flower'
  | 'gem'
  | 'party'
  | 'globe'
  | 'sparkle'
  | 'gift'
  | 'trophy'
  | 'ticket'
  | 'diamonds'
  | 'camera'
  | 'disk'
  | 'piano';

export type GiftBadgeKind =
  | 'new'
  | 'vip'
  | 'couple'
  | 'friend'
  | 'jackpot'
  | 'combo'
  | 'level';

export interface GiftBadge {
  kind: GiftBadgeKind;
  /** Tier labels ride in the badge text itself on the panel (VIP6, Lv.14). */
  label?: string;
}

export interface GiftEntry {
  id: string;
  name: string;
  /** Coin price. Displayed only — the wallet is server-side. */
  price: number;
  art: GiftArt;
  badge?: GiftBadge;
  /** The little clock chip marks a limited-time item. */
  timeLimited?: boolean;
  /** The camera chip marks a gift that plays over the occupant's camera. */
  onCamera?: boolean;
}

export interface GiftCategoryData {
  key: GiftCategoryKey;
  label: string;
  /** Notification dot; clears only after the content is viewed server-side. */
  unviewed?: boolean;
  entries: GiftEntry[];
}

export interface GiftUpgradeProgress {
  /** 0..1 display fraction of the room upgrade bar. */
  fraction: number;
  /** The "… Coins needed to upgrade" line; display-only. */
  coinsNeeded: number;
}

export interface LuckyMeters {
  /** The jackpot pill's total; dynamic server data shown as text. */
  jackpotTotal: number;
  /** Multiplier chips around the lucky sack, in panel order. */
  multipliers: string[];
}

export interface GiftCountdown {
  days: number;
  /** The `HH MM SS` segment chips. */
  clockSegments: [string, string, string];
}

export interface GiftCatalogModel {
  categories: GiftCategoryData[];
  upgrade: GiftUpgradeProgress;
  lucky: LuckyMeters;
  countdown: GiftCountdown;
  /** The event bumper's title. */
  eventTitle: string;
}

/** What a tools-drawer entry may do in this front-end phase. */
export type RoomToolAction =
  /** A server-backed tool: reports the gate when pressed. */
  | 'backend'
  /** A client-only display toggle: hides the chat overlay in place. */
  | 'clear-screen';

/** Tool glyph meanings — the drawer maps each to a Lucide meaning. */
export type RoomToolIcon =
  | 'gift'
  | 'sparkle'
  | 'party'
  | 'trophy'
  | 'games'
  | 'share'
  | 'mute'
  | 'music-list'
  | 'beauty'
  | 'effects'
  | 'store'
  | 'flip-camera'
  | 'welcome'
  | 'clear-screen';

export interface RoomTool {
  id: string;
  label: string;
  icon: RoomToolIcon;
  /** The little red dot some launches carry in the reference. */
  dot?: boolean;
  action: RoomToolAction;
}

export interface RoomToolSection {
  id: string;
  title: string;
  tools: RoomTool[];
  /**
   * The games row packs five compact slots across; tool grids use four
   * roomier slots so longer labels (Special Effects Setting) fit.
   */
  narrow?: boolean;
}

/** The messages sheet's system-level rows (reference 014). */
export type RoomInboxSystemKey = 'interactions' | 'team' | 'moments';

export interface RoomInboxSystem {
  id: string;
  key: RoomInboxSystemKey;
  title: string;
  subtitle: string;
  /** The team entry's red unread stack in the reference; a server-owned count. */
  badge?: number;
  /** ISO-8601. Only Interactions and the Team carry a clock in the reference. */
  lastMessageAt?: string;
}

/** The messages sheet opened from inside a room, on top of the canvas. */
export interface RoomInboxModel {
  system: RoomInboxSystem[];
  /** The latest conversations, newest first; the page size is the seam's. */
  conversations: ConversationSummary[];
}

/**
 * One rung of the coin-to-diamond exchange ladder. Both sides are
 * server-configured financial values; the client never invents a rate or
 * applies an exchange locally.
 */
export interface DiamondExchangeTier {
  id: string;
  coins: number;
  diamonds: number;
}

/** The My Diamonds page: server-owned balance plus the exchange ladder. */
export interface DiamondsWallet {
  /** The viewer's diamond balance. No local credit ever applies. */
  balance: number;
  tiers: DiamondExchangeTier[];
}

/** The relationship kinds the chooser offers. */
export type RelationshipTypeKey = 'couple' | 'friend';

/**
 * One rung of the relationship chooser: an invitation card the server prices.
 * The coin price and the acceptance window are server-configured financial
 * terms — the client displays them and never creates a relationship itself;
 * a link exists only once the other member accepts.
 */
export interface RelationshipOffer {
  id: RelationshipTypeKey;
  /** The member-facing label, e.g. "Couple". */
  label: string;
  /** The invitation card's coin price. */
  coins: number;
  /** Hours an invitation stays valid before the server expires and refunds it. */
  validityHours: number;
}

/** The chooser's offer list, in its display order. */
export interface RelationshipOffers {
  offers: RelationshipOffer[];
}

/** The two membership families the hub tab bar serves. */
export type MembershipFamilyKey = 'vip' | 'svip';

/** One privilege the served SVIP level grants or previews. */
export interface MembershipPrivilege {
  id: string;
  /** Neutral client label; proprietary feature art stays out. */
  label: string;
  /** The level the privilege belongs to, e.g. "SVIP7". */
  requiredLevel: string;
}

/** One purchasable premium asset in the store panel. */
export interface MembershipStoreItem {
  id: string;
  /** Display category, e.g. "Vehicles" or "Frames". */
  category: string;
  /** The minimum level badge shown on the card, when the item has one. */
  requiredLevel?: string;
  /** Server price in membership points. The client never computes a price. */
  price: number;
  /** Server-configured validity, in days. */
  validityDays: number;
}

/** One rung of the VIP ladder: label plus the XP target that unlocks it. */
export interface MembershipTierLevel {
  label: string;
  /** Server-configured XP target; 0 for the entry rung (any recharge). */
  xp: number;
}

/**
 * The art a VIP benefit tile paints when it is not a plain glyph. These are
 * layout families, not borrowed illustrations — the view draws each one with
 * its own geometry.
 */
export type MembershipBenefitArt =
  | 'label'
  | 'crest'
  | 'entry'
  | 'room-followed'
  | 'room-joined'
  | 'gift-art';

/** The plain-glyph meanings a VIP benefit tile can carry. */
export type MembershipBenefitGlyph =
  | 'eye'
  | 'user-check'
  | 'house'
  | 'crown'
  | 'image'
  | 'store'
  | 'filter'
  | 'pencil'
  | 'gift'
  | 'friends'
  | 'silence';

/** One VIP benefit tile. Locking is derived from the viewed rung. */
export interface MembershipBenefit {
  id: string;
  /** Neutral client label; proprietary feature art stays out. */
  label: string;
  /** A glyph tile; omitted when `art` paints the tile instead. */
  glyph?: MembershipBenefitGlyph;
  /** A composed art tile; takes precedence over `glyph`. */
  art?: MembershipBenefitArt;
  /** The rung that unlocks the benefit, e.g. "VIP5". */
  unlockLevel: string;
}

/** The VIP family's designed page: hero, ladder, benefit matrix, store. */
export interface MembershipVipHub {
  family: 'vip';
  /** Server-owned points balance, display-only. */
  points: number;
  /** The viewer's identity for the hero row. */
  hero: {
    displayName: string;
    avatarUrl: string;
    /** The warm scene the hero sits on; a media ref or a remote URL. */
    backgroundUrl: string;
    /** The heart the reference floats beside the name. */
    heart: boolean;
  };
  /** The rung the viewer holds; every other crest reads Locked. */
  currentLevel: string;
  /** The full ladder; the view windows it around the selection. */
  levels: MembershipTierLevel[];
  benefits: MembershipBenefit[];
  store: MembershipStoreItem[];
}

/** One level in the SVIP ladder, with its privileges. */
export interface MembershipLevelGroup {
  label: string;
  /** Server fact: whether the viewer holds this level right now. */
  current: boolean;
  privileges: MembershipPrivilege[];
}

/** The SVIP family's page: crest level band, privilege cards, store. */
export interface MembershipSvipHub {
  family: 'svip';
  /** Server-owned points balance, display-only. */
  points: number;
  levels: MembershipLevelGroup[];
  store: MembershipStoreItem[];
}

/** The membership hub for one family. The family field discriminates the design. */
export type MembershipHub = MembershipVipHub | MembershipSvipHub;


/**
 * The live room page. The reference draws one full-bleed room canvas: host
 * header, event banners, ten numbered seats, an audience strip, a chat overlay
 * with welcome/system notices, a floating event card, and a composer.
 *
 * Voice delivery, seating, gifting and draws are server-phase: this type only
 * carries what the shell paints. Every money/sound action is toast-gated.
 */
export interface LiveRoom {
  id: string;
  name: string;
  coverUrl?: string;
  host: RoomHost;
  /** Seat list, always length ten so the grid never needs emptiness handling. */
  seats: RoomSeat[];
  /** Well-above-body count for the audience strip. */
  audienceCount: number;
  /** The few faces the strip itself shows. */
  audience: { id: string; avatarUrl?: string; avatarFrame?: AvatarFrameKey }[];
  /** The Room Details sheet's content, opened from the room's calendar control. */
  details: LiveRoomDetails;
  /** The tiny win-ticker portraits between the host pill and the exit button. */
  floatAvatars: string[];
  /** E.g. "Hourly Top 50" — a display label, not a computed rank. */
  rankLabel: string;
  /** The marquee banner: who just won, board fill, next draw clock. */
  ticker: { headline: string; progressLabel: string; countdownLabel: string };
  /** Whether the gold free-draw banner shows (event phase is backend-gated). */
  freeDraw: boolean;
  /** The composer badge's chat unread. Server-owned, display-only. */
  chatUnread: number;
  /** The utilities control's announcement dot. Server attention state, display-only. */
  toolsAttention: boolean;
  welcomeText: string;
  introduction: string;
  /** Event notices render under the introduction with a GO affordance. */
  eventNotices: RoomFeedNotice[];
  /** The floating promo card above the composer, art + title + clock. */
  eventCard: { title: string; countdownLabel: string; artUrl: string };
}

export interface ConversationSummary {
  id: string;
  peerId: string;  peerName: string;
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

/**
 * One bubble in a conversation. Media, voice and gift messages are
 * server-phase — presenting them as a client fixture would imply features the
 * backend has to meter — so threads carry three text kinds only:
 *
 * - `text` — an ordinary two-party bubble.
 * - `notice` — the peer's follow/relationship notice, drawn with the ornamented
 *   corners the reference gives its system-adjacent lines.
 * - `milestone` — a server-issued relationship level strip. Its author id is
 *   empty: the viewer and the peer did not write it.
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  /** The peer, the viewer (`FIXTURE_ME_ID`), or empty for a `milestone`. */
  authorId: string;
  kind: 'text' | 'notice' | 'milestone';
  text: string;
  /** ISO-8601, ascending across the thread. Formatting happens in the UI layer. */
  sentAt: string;
}

/**
 * A conversation's full page: the summary it belongs to, its history oldest
 * first, plus everything the top card and the composer need. `intimacyLevel`
 * and the media strips are server-owned presentation — displayed values the
 * client never adjusts — and `viewer` carries the identity the outgoing rows
 * need for their avatar (the summary's `peerId` marks the other side).
 */
export interface ConversationThread {
  conversation: ConversationSummary;
  /** The peer's directory entry, for the card's pills and profile deep link. */
  peer: UserSummaryIdentity;
  /** Four stills the peer presents on their card. Reading only, never a picker. */
  peerMedia: string[];
  viewer: { avatarUrl?: string; avatarFrame?: AvatarFrameKey };
  /** Relationship level between the two sides. Server-owned; shown, not computed. */
  intimacyLevel: number;
  messages: ChatMessage[];
}

/** The fields of `UserSummary` the thread's card relies on. */
export interface UserSummaryIdentity {
  id: string;
  displayName: string;
  status: string;
  age?: number;
  gender?: Gender;
  vipTier?: number;
  locale?: string;
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

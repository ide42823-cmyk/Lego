/**
 * Deterministic development fixtures.
 *
 * These exist so every screen can be built and reviewed (including loading,
 * empty and error states) before a backend exists. They are generated from a
 * seeded PRNG rather than hand-written literals so the data is stable across
 * runs and machines.
 *
 * Names deliberately mix Arabic and Latin script so RTL and mixed-direction text
 * are exercised from day one (a hard requirement in the reference analysis).
 *
 * This module is deleted once the real API is wired in; nothing outside
 * `src/core/data/repository.ts` should import it.
 */

import { mediaRef, type MediaFolder } from '@/core/media/images';

import type {
  AvatarFrameKey,
  ConversationSummary,
  Gender,
  HonorArt,
  HonorEntry,
  HonorWall,
  MeDashboard,
  MomentPost,
  ProfileInfoRow,
  ProfileTag,
  PromoBanner,
  RelationshipRecord,
  RoomBadge,
  RoomCategory,
  RoomSummary,
  UserBadge,
  UserProfile,
  UserSummary,
} from './types';

/** Small, fast, seeded PRNG (mulberry32) — deterministic across runs. */
function createRandom(seed: number) {
  let a = seed >>> 0;
  return function random(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, list: readonly T[]): T {
  return list[Math.floor(random() * list.length)] as T;
}

function pickSome<T>(random: () => number, list: readonly T[], max: number): T[] {
  const count = Math.floor(random() * (max + 1));
  const pool = [...list];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    out.push(pool.splice(Math.floor(random() * pool.length), 1)[0] as T);
  }
  return out;
}

/**
 * Names are split by gender so a member's name, chips ("Her Room"), cover and
 * avatar photo all agree. Each pool is long enough for the 12 members per gender
 * that `buildUsers` creates.
 */
const FEMALE_NAMES = [
  'Maya K.',
  'ليان',
  'Ivy',
  'نورة',
  'سارة',
  'Zara',
  'ريم',
  'Amara',
  'هيا',
  'لمى',
  'دانة',
  'Priya',
  'منال',
] as const;

const MALE_NAMES = [
  'Leo',
  'عبدالله',
  'Noah',
  'Theo',
  'Milo',
  'فهد',
  'Kenji',
  'خالد',
  'Diego',
  'Yusuf',
  'Oskar',
  'Omar',
] as const;

function mediaPool(folder: MediaFolder, prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    mediaRef(folder, `${prefix}${String(index + 1).padStart(2, '0')}`),
  );
}

/**
 * Test photography, split by the gender the photo presents. The counts differ
 * because that is what the sources offered; a pool repeats rather than leaving a
 * member without an image.
 */
const PORTRAITS: Record<Gender, string[]> = {
  female: mediaPool('portraits', 'f', 12),
  male: mediaPool('portraits', 'm', 12),
};

const COVERS: Record<Gender, string[]> = {
  female: mediaPool('covers', 'f', 3),
  male: mediaPool('covers', 'm', 4),
};

const POST_PHOTOS: Record<Gender, string[]> = {
  female: mediaPool('posts', 'f', 6),
  male: mediaPool('posts', 'm', 2),
};

/** Room atmosphere art, shared across the list rather than tied to a member. */
const ROOM_COVERS = mediaPool('rooms', 'r', 8);

const STATUS_LINES = [
  'Coffee, playlists and long walks.',
  'هنا للدردشة والضحك.',
  'Learning a new language this year.',
  'أحب الموسيقى الهادئة.',
  'Always up for a good room.',
  'أبحث عن أصدقاء جدد.',
  'Night owl, early riser. Somehow both.',
  'الرياضيات ممتعة، صدقني.',
] as const;

const LOCALES = ['SA', 'AE', 'EG', 'MA', 'GB', 'DE', 'JP', 'US', 'TR', 'IN'] as const;

const ROOM_NAMES = [
  'Sunset Lounge',
  'ديوان الشعر',
  'Neon Nights',
  'قهوة الصباح',
  'Chill & Chat',
  'غرفة الهدوء',
  'Late Night Radio',
  'مجلس الأصدقاء',
  'Studio Beats',
  'عالم القصص',
] as const;

const ROOM_DESCRIPTIONS = [
  'Open mic, everyone welcome.',
  'نقاش هادئ وموسيقى.',
  'Request a track, stay a while.',
  'أهلاً بالجميع، لا حاجة للكلام.',
  'Stories, quizzes and good company.',
] as const;

const ROOM_TAGS = [
  'Music',
  'Chill',
  'Games',
  'موسيقى',
  'شعر',
  'Talk',
  'Study',
  'عائلة',
  'Sports',
] as const;

const HOST_NAMES = ['Rana', 'عمر', 'Jules', 'هدى', 'Ben', 'شهد', 'Tomas'] as const;

const CONVERSATION_SNIPPETS = [
  'See you in the room tonight?',
  'شكراً على الهدية!',
  'That playlist was perfect.',
  'أرسل لي الرابط لو سمحت.',
  'Haha true. Talk later.',
  'تصبح على خير.',
] as const;

const MOMENT_TEXTS = [
  'Trying the new room format tonight — come say hi.',
  'من أجمل غروب شفته هذا الأسبوع.',
  'Three songs in and already found a favourite.',
  'أول مرة أجرب الغرفة الصوتية، التجربة رائعة.',
  'Small win today: finished the book.',
  'هدية من صديق، شكراً لك.',
] as const;

/** One topic per post, printed as the `#` pill beneath the media. */
const MOMENT_HASHTAGS = ['Love', 'Night', 'Coffee', 'Travel', 'Music', 'Vibes'] as const;

const BANNERS: PromoBanner[] = [
  {
    id: 'banner-families',
    title: 'Families Square',
    subtitle: 'Find a family that fits',
    ctaLabel: 'Explore',
  },
  { id: 'banner-event', title: 'Event Center', subtitle: 'Party Square is live', ctaLabel: 'Open' },
  {
    id: 'banner-recharge',
    title: 'Recharge',
    subtitle: 'Top up and unlock rooms',
    ctaLabel: 'Recharge',
  },
];

const BADGE_POOL: UserBadge[] = ['level', 'vip', 'verified', 'new', 'aristocracy', 'svip'];

/** Reference point for generated timestamps. Relative so the UI reads naturally. */
const NOW = Date.now();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The frames members can wear, in a fixed order. `halo` is deliberately absent:
 * it is the animated one and is reserved for the account's own avatar, so the
 * decoration never animates inside a list.
 */
const MEMBER_FRAMES: readonly AvatarFrameKey[] = ['blossom', 'wings', 'heart', 'rope'];

function buildUsers(count: number): UserSummary[] {
  const random = createRandom(20261018);
  // Distances come from a separate stream so adding them cannot shift the value
  // of every other generated field.
  const distance = createRandom(20261019);
  return Array.from({ length: count }, (_, index): UserSummary => {
    const level = 1 + Math.floor(random() * 60);
    const badges = ['level', ...pickSome(random, BADGE_POOL, 2)].slice(0, 3) as UserBadge[];
    // Gender first: the name, the chips the profile derives from it, the cover
    // and the portrait all follow from this one decision.
    const gender: Gender = index % 2 === 0 ? 'female' : 'male';
    const names = gender === 'female' ? FEMALE_NAMES : MALE_NAMES;
    const portraits = PORTRAITS[gender];
    const slot = Math.floor(index / 2);
    return {
      id: `user-${index + 1}`,
      displayName: names[slot % names.length] as string,
      avatarUrl: portraits[slot % portraits.length],
      status: pick(random, STATUS_LINES),
      locale: pick(random, LOCALES),
      level,
      age: 18 + Math.floor(random() * 22),
      gender,
      // Only a member who holds a paid rank gets a number to display.
      vipTier: badges.includes('vip') ? 1 + Math.floor(random() * 5) : undefined,
      videoCall: random() > 0.7,
      // Every third member wears a frame, cycling through the set. The member at
      // index 2 (user-3) does, which is the profile the device pass screenshots.
      avatarFrame: (index + 1) % 3 === 0 ? MEMBER_FRAMES[index % MEMBER_FRAMES.length] : undefined,
      badges,
      isOnline: random() > 0.45,
      // Coarse buckets only. The reference prints a rough distance on every
      // directory row, and a bucket is never a position.
      distanceKm: 2 + Math.floor(distance() * 90) * 11,
    };
  });
}

function buildRooms(count: number): RoomSummary[] {
  const random = createRandom(777001);
  const categories: RoomCategory[] = ['chat', 'families', 'friendship', 'video'];
  const roomBadges: RoomBadge[] = ['official', 'featured', 'trending'];
  return Array.from({ length: count }, (_, index): RoomSummary => {
    const category = pick(random, categories);
    return {
      id: `room-${index + 1}`,
      name: pick(random, ROOM_NAMES),
      description: pick(random, ROOM_DESCRIPTIONS),
      coverUrl: ROOM_COVERS[index % ROOM_COVERS.length],
      hostName: pick(random, HOST_NAMES),
      hostLevel: 1 + Math.floor(random() * 60),
      category,
      participantCount: Math.floor(random() * 480),
      country: pick(random, LOCALES),
      language: random() > 0.5 ? 'ar' : 'en',
      badges: pickSome(random, roomBadges, 1),
      tags: pickSome(random, ROOM_TAGS, 2),
    };
  });
}

function buildConversations(users: UserSummary[], count: number): ConversationSummary[] {
  const random = createRandom(31337);
  return Array.from({ length: count }, (_, index): ConversationSummary => {
    // The peer is a real directory entry, so the inbox row cannot disagree with
    // that member's name, photo or locale anywhere else in the app.
    const peer = users[(index * 3) % users.length] as UserSummary;
    return {
      id: `conversation-${index + 1}`,
      peerId: peer.id,
      peerName: peer.displayName,
      avatarUrl: peer.avatarUrl,
      avatarFrame: peer.avatarFrame,
      locale: peer.locale,
      snippet: pick(random, CONVERSATION_SNIPPETS),
      lastMessageAt: new Date(NOW - Math.floor(random() * 5 * DAY)).toISOString(),
      unreadCount: random() > 0.6 ? 1 + Math.floor(random() * 9) : 0,
      isOnline: random() > 0.5,
    };
  });
}

/**
 * Moments are written by the same people who appear in the discovery
 * directories, so each post borrows its author's real level and badges instead
 * of re-deriving them. That is what stops a feed card from contradicting the
 * same person's row elsewhere in the app.
 */
function buildMoments(users: UserSummary[], count: number): MomentPost[] {
  const random = createRandom(99001);
  return Array.from({ length: count }, (_, index) => {
    const author = users[(index * 7) % users.length] as UserSummary;
    const gender = author.gender ?? 'female';
    const posts = POST_PHOTOS[gender];
    const hasMedia = index % 3 !== 1;
    return {
      id: `moment-${index + 1}`,
      authorId: author.id,
      authorName: author.displayName,
      authorVipTier: author.vipTier,
      authorLevel: author.level,
      authorAge: author.age,
      authorGender: author.gender,
      avatarUrl: author.avatarUrl,
      avatarFrame: author.avatarFrame,
      badges: author.badges,
      hashtag: MOMENT_HASHTAGS[index % MOMENT_HASHTAGS.length],
      hasMedia,
      // Media is the author's own photo pool, so a card never shows a stranger's
      // face as the author's post.
      mediaUrl: hasMedia ? posts[index % posts.length] : undefined,
      text: pick(random, MOMENT_TEXTS),
      createdAt: new Date(NOW - Math.floor(random() * 3 * DAY)).toISOString(),
      likeCount: Math.floor(random() * 320),
      commentCount: Math.floor(random() * 48),
      likedByMe: false,
    };
  });
}

export const FIXTURE_USERS = buildUsers(24);
export const FIXTURE_ROOMS = buildRooms(18);
export const FIXTURE_CONVERSATIONS = buildConversations(FIXTURE_USERS, 14);
export const FIXTURE_MOMENTS = buildMoments(FIXTURE_USERS, 10);

export const FIXTURE_BANNERS: PromoBanner[] = BANNERS;

export const FIXTURE_ME: MeDashboard = {
  userId: 'user-me',
  displayName: 'My Account',
  handle: '@myaccount',
  avatarUrl: mediaRef('portraits', 'self'),
  // The only avatar in the app wearing the animated frame.
  avatarFrame: 'halo',
  followingCount: 128,
  friendCount: 42,
  followersCount: 311,
  coinBalance: 260,
  notificationCount: 3,
  memberships: [
    { id: 'vip', label: 'VIP', status: 'active', detail: 'Renews in 12 days' },
    { id: 'svip', label: 'SVIP', status: 'available', detail: 'Unlock exclusive rooms' },
    {
      id: 'aristocracy',
      label: 'Aristocracy',
      status: 'available',
      detail: 'Advanced entertainment',
    },
  ],
};

/* -------------------------------------------------------------------------
 * Public profile fixtures (reference screens 001, 018, 021–028)
 * ---------------------------------------------------------------------- */

const PROFILE_SIGNATURES = [
  'Coffee, playlists and long walks.',
  'هنا للدردشة والضحك، أهلاً بك.',
  'Learning a new language this year.',
  'أحب الموسيقى الهادئة والقراءة.',
  'Always up for a good room.',
  'أبحث عن أصدقاء جدد من كل مكان.',
  'Night owl, early riser. Somehow both.',
  'الرياضيات ممتعة، صدقني.',
] as const;

const PROFILE_TAGS: readonly ProfileTag[] = [
  { emoji: '🌅', label: 'Early Bird' },
  { emoji: '✈️', label: 'Traveling' },
  { emoji: '💃', label: 'Dancing' },
  { emoji: '💄', label: 'Makeup' },
  { emoji: '🏊', label: 'Swimming' },
  { emoji: '🎻', label: 'Classical' },
  { emoji: '🐴', label: 'Horses' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🌹', label: 'Romance' },
  { emoji: '💗', label: 'Emotional' },
  { emoji: '🏀', label: 'Basketball' },
  { emoji: '📚', label: 'Reading' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🍜', label: 'Food' },
] as const;

const OCCUPATIONS = [
  'Engineer',
  'Student',
  'Designer',
  'Teacher',
  'Photographer',
  'Nurse',
] as const;

const FAMILY_NAMES = [
  'Ember Court',
  'عائلة الامبراطور',
  'Silver Line',
  'عائلة القمر',
  'North Star',
] as const;

const TITLES = [
  'Rising Host',
  'Top Listener',
  'Room Founder',
  'Event Captain',
  'Golden Voice',
] as const;

/** Agency names printed on the rank chip, above a figure such as "5". */
const AGENCY_NAMES = ['NUMBER ONE', 'ROYAL STAR', 'GOLDEN LINE', 'SILK ROAD', 'NIGHT OWL'] as const;

const EMBLEM_ARTS: readonly HonorArt[] = ['crown', 'star', 'gem', 'trophy', 'sparkle'];

const GIFTS: readonly { label: string; art: HonorEntry['art']; rarity?: string }[] = [
  { label: 'Ember Rose', art: 'gift' },
  { label: 'Cloud Palace', art: 'gem', rarity: 'Rare' },
  { label: 'Solar Bull', art: 'crown' },
  { label: 'Night Lantern', art: 'star' },
  { label: 'Silk Ribbon', art: 'sparkle' },
] as const;

/**
 * Coarse locale *names*. Deliberately country-level: the profile shows a
 * nationality and a country, never a precise address — the same privacy rule the
 * directory rows follow.
 */
const LOCALE_NAMES: Record<string, string> = {
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  EG: 'Egypt',
  MA: 'Morocco',
  GB: 'United Kingdom',
  DE: 'Germany',
  JP: 'Japan',
  US: 'United States',
  TR: 'Türkiye',
  IN: 'India',
};

/** Sign boundaries in calendar order; later entries win, so the scan is linear. */
const ZODIAC_BOUNDARIES: readonly { sign: string; month: number; day: number }[] = [
  { sign: 'Capricorn', month: 1, day: 1 },
  { sign: 'Aquarius', month: 1, day: 20 },
  { sign: 'Pisces', month: 2, day: 19 },
  { sign: 'Aries', month: 3, day: 21 },
  { sign: 'Taurus', month: 4, day: 20 },
  { sign: 'Gemini', month: 5, day: 21 },
  { sign: 'Cancer', month: 6, day: 21 },
  { sign: 'Leo', month: 7, day: 23 },
  { sign: 'Virgo', month: 8, day: 23 },
  { sign: 'Libra', month: 9, day: 23 },
  { sign: 'Scorpio', month: 10, day: 23 },
  { sign: 'Sagittarius', month: 11, day: 22 },
  { sign: 'Capricorn', month: 12, day: 22 },
];

function zodiacFor(month: number, day: number): string {
  let sign = 'Capricorn';
  for (const boundary of ZODIAC_BOUNDARIES) {
    if (month > boundary.month || (month === boundary.month && day >= boundary.day)) {
      sign = boundary.sign;
    }
  }
  return sign;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Maps a member's real badge to the art shown on the Badges Wall, so the wall
 * can never show a trophy the member does not hold.
 */
function badgeHonorEntries(user: UserSummary): HonorEntry[] {
  const art: Partial<Record<UserBadge, { label: string; art: HonorEntry['art'] }>> = {
    level: { label: user.level ? `Level ${user.level}` : 'Level', art: 'star' },
    vip: { label: user.vipTier ? `VIP${user.vipTier}` : 'VIP', art: 'crown' },
    svip: { label: 'SVIP', art: 'crown' },
    aristocracy: { label: 'Aristocracy', art: 'shield' },
    verified: { label: 'Verified', art: 'shield' },
    new: { label: 'Newcomer', art: 'sparkle' },
  };

  return user.badges
    .flatMap((badge) => {
      const entry = art[badge];
      return entry ? [{ id: `honor-${user.id}-${badge}`, label: entry.label, art: entry.art }] : [];
    })
    .slice(0, 3);
}

function buildHonor(user: UserSummary, random: () => number): HonorWall[] {
  const badges = badgeHonorEntries(user);
  const titles = random() > 0.35 ? [pick(random, TITLES)] : [];
  const giftCount = 3;
  const gifts: HonorEntry[] = Array.from({ length: giftCount }, (_, index) => {
    const source = GIFTS[(index + Math.floor(random() * GIFTS.length)) % GIFTS.length] as {
      label: string;
      art: HonorEntry['art'];
      rarity?: string;
    };
    return {
      id: `honor-${user.id}-gift-${index + 1}`,
      label: source.label,
      art: source.art,
      // Grades read as a coarse quality band, never a price.
      grade: index === 0 ? 'B' : 'A',
      rarity: source.rarity,
    };
  });

  return [
    {
      key: 'badges',
      title: 'Badges Wall',
      count: badges.length + 6 + Math.floor(random() * 8),
      entries: badges,
      emptySlots: Math.max(0, 3 - badges.length),
    },
    {
      key: 'titles',
      title: 'Titles Wall',
      count: titles.length,
      entries: titles.map((label, index) => ({
        id: `honor-${user.id}-title-${index + 1}`,
        label,
        art: 'trophy' as const,
      })),
      emptySlots: Math.max(0, 3 - titles.length),
    },
    {
      key: 'gifts',
      title: 'Gifts Honor Wall',
      count: 40 + Math.floor(random() * 260),
      entries: gifts,
    },
  ];
}

function buildInfo(
  user: UserSummary,
  memberNumber: string,
  random: () => number,
  birthday: { month: number; day: number },
  registered: Date,
): ProfileInfoRow[] {
  const country = LOCALE_NAMES[user.locale ?? ''] ?? '—';
  const rows: ProfileInfoRow[] = [];

  rows.push({
    key: 'id',
    icon: 'id',
    text: `ID ${memberNumber}`,
    copyable: true,
    copyValue: memberNumber,
  });

  // Height/weight are round, coarse values — the reference shows the same, and a
  // profile never needs false precision.
  if (random() > 0.15) {
    rows.push({
      key: 'height',
      icon: 'height',
      text: `Height ${150 + Math.floor(random() * 40)}cm`,
    });
  }
  if (random() > 0.25) {
    rows.push({
      key: 'weight',
      icon: 'weight',
      text: `Weight ${45 + Math.floor(random() * 40)}kg`,
    });
  }
  // A member may leave occupation blank; the row is then omitted entirely rather
  // than rendered as "Occupation —".
  if (random() > 0.3) {
    rows.push({
      key: 'occupation',
      icon: 'occupation',
      text: `Occupation ${pick(random, OCCUPATIONS)}`,
    });
  }
  rows.push({ key: 'nationality', icon: 'nationality', text: `Nationality ${country}` });
  rows.push({ key: 'address', icon: 'address', text: `Current Address ${country}` });
  rows.push({
    key: 'birthday',
    icon: 'birthday',
    text: `Birthday ${pad2(birthday.month)}/${pad2(birthday.day)}`,
  });
  rows.push({
    key: 'constellation',
    icon: 'constellation',
    text: `Constellation ${zodiacFor(birthday.month, birthday.day)}`,
  });
  rows.push({
    key: 'registered',
    icon: 'registered',
    text: `Registration Time ${registered.getFullYear()}/${pad2(registered.getMonth() + 1)}/${pad2(
      registered.getDate(),
    )}`,
  });

  return rows;
}

function buildRelationship(
  user: UserSummary,
  peer: UserSummary,
  kind: RelationshipRecord['kind'],
  level: number,
  days: number,
): RelationshipRecord {
  return {
    id: `${kind}-${user.id}-${peer.id}`,
    kind,
    peerId: peer.id,
    peerName: peer.displayName,
    // The card shows the peer's face, so it must be the same photo the rest of
    // the app shows for that member.
    peerAvatarUrl: peer.avatarUrl,
    peerFrame: peer.avatarFrame,
    level,
    days,
  };
}

/**
 * Builds one member's public profile.
 *
 * Everything derives from the member's directory entry plus a dedicated PRNG
 * stream, so a profile can never contradict that person's row: the name, avatar,
 * level, age, gender and badges are the same objects the directories render.
 *
 * `women`/`friends` are deliberately absent for some members — the screen has to
 * render its no-couple and no-friends states with real data, not a code path that
 * is never exercised.
 */
function buildProfile(user: UserSummary, index: number, users: UserSummary[]): UserProfile {
  // A separate stream from `buildUsers`, so adding profile data cannot shift any
  // value the directories already generated.
  const random = createRandom(20261020 + index);

  const month = 1 + Math.floor(random() * 12);
  const day = 1 + Math.floor(random() * 27);
  const birthday = { month, day };
  const registered = new Date(NOW - (30 + Math.floor(random() * 900)) * DAY);

  const tags = pickSome(random, PROFILE_TAGS, 6);

  const couplePeer = users[(index + 7) % users.length] as UserSummary;
  const friendA = users[(index + 3) % users.length] as UserSummary;
  const friendB = users[(index + 11) % users.length] as UserSummary;

  const hasCouple = index % 3 !== 0;
  const friendCount = index % 5 === 0 ? 0 : 2;

  const friends = [friendA, friendB]
    .slice(0, friendCount)
    .map((peer, friendIndex) =>
      buildRelationship(
        user,
        peer,
        'friend',
        20 + Math.floor(random() * 20),
        60 + friendIndex * 40 + Math.floor(random() * 90),
      ),
    );

  const moments = buildProfileMoments(user, random);
  const locale = user.locale ?? 'SA';
  const gender = user.gender ?? 'female';
  /**
   * The member-facing number the reference prints on the ID row. Derived, stable,
   * and unrelated to `user.id` — that one is the routing key and never shown.
   */
  const memberNumber = String(231000000 + ((index * 7919) % 8_000_000));

  const covers = COVERS[gender];
  const albumPhotos = POST_PHOTOS[gender];

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    avatarFrame: user.avatarFrame,
    // A member's cover is a portrait crop of the same person, the way the
    // reference's hero is.
    coverUrl: covers[index % covers.length],
    status: user.status,
    // Presence recency: online members are "Just now", others range over days.
    lastActiveAt: new Date(
      user.isOnline ? NOW - 30_000 : NOW - Math.floor(5 + random() * 4_000) * MINUTE,
    ).toISOString(),
    age: user.age,
    gender: user.gender,
    level: user.level,
    vipTier: user.vipTier,
    badges: user.badges,
    isOnline: user.isOnline,
    familyName: random() > 0.35 ? pick(random, FAMILY_NAMES) : undefined,

    // Two cover thumbnails, as the reference shows. The first is the avatar, so
    // the compact header and the strip can never show two different people.
    photos: [
      { id: `${user.id}-photo-1`, imageUrl: user.avatarUrl },
      { id: `${user.id}-photo-2`, imageUrl: albumPhotos[index % albumPhotos.length] },
    ],
    charmLevel: 1 + Math.floor(random() * 30),
    wealthLevel: 1 + Math.floor(random() * 20),
    agency:
      random() > 0.35
        ? { rank: 1 + Math.floor(random() * 99), name: pick(random, AGENCY_NAMES) }
        : undefined,
    emblem:
      random() > 0.25 ? { art: pick(random, EMBLEM_ARTS), label: 'Profile crest' } : undefined,

    signature: pick(random, PROFILE_SIGNATURES),
    tags,
    roomShortcut: {
      kind: 'room',
      // Deep-links to a real room in the directory fixtures.
      id: (FIXTURE_ROOMS[index % FIXTURE_ROOMS.length] as RoomSummary).id,
      label: user.gender === 'male' ? 'His Room' : 'Her Room',
      // A room can be empty, which is a real state the tile has to survive.
      memberCount: Math.floor(random() * 40),
      tone: 'room',
    },
    familyShortcut: {
      kind: 'family',
      id: `family-${(index % 6) + 1}`,
      label: user.gender === 'male' ? 'His family' : 'Her family',
      memberCount: 20 + Math.floor(random() * 70),
      tone: 'family',
      verified: index % 3 !== 0,
    },
    info: [
      // The mutual-follower line only exists when the relationship is mutual.
      ...(index % 4 === 0
        ? [{ key: 'mutual', icon: 'mutual' as const, text: "You're now mutual followers" }]
        : []),
      ...buildInfo({ ...user, locale }, memberNumber, random, birthday, registered),
    ],
    honor: buildHonor(user, random),
    moments,
    momentCount: moments.length,
    couple: hasCouple
      ? buildRelationship(
          user,
          couplePeer,
          'couple',
          12 + Math.floor(random() * 30),
          30 + Math.floor(random() * 200),
        )
      : undefined,
    friends,
    following: index % 3 !== 1,
    mutual: index % 4 === 0,
  };
}

/**
 * The posts shown on a member's profile.
 *
 * Prefers the posts that member already wrote in the shared Moments feed, so the
 * same post cannot read differently in two places. Members the feed generator did
 * not pick get their own deterministic posts instead of an empty tab.
 */
function buildProfileMoments(user: UserSummary, random: () => number): MomentPost[] {
  const existing = FIXTURE_MOMENTS.filter((post) => post.authorId === user.id);
  if (existing.length > 0) {
    return existing;
  }

  const count = 1 + Math.floor(random() * 3);
  const gender = user.gender ?? 'female';
  const posts = POST_PHOTOS[gender];
  return Array.from({ length: count }, (_, index) => {
    const hasMedia = index % 3 !== 1;
    return {
      id: `moment-${user.id}-${index + 1}`,
      authorId: user.id,
      authorName: user.displayName,
      authorVipTier: user.vipTier,
      authorLevel: user.level,
      authorAge: user.age,
      authorGender: user.gender,
      avatarUrl: user.avatarUrl,
      avatarFrame: user.avatarFrame,
      badges: user.badges,
      hashtag: MOMENT_HASHTAGS[index % MOMENT_HASHTAGS.length],
      hasMedia,
      mediaUrl: hasMedia ? posts[index % posts.length] : undefined,
      text: pick(random, MOMENT_TEXTS),
      createdAt: new Date(NOW - Math.floor(random() * 6 * DAY)).toISOString(),
      likeCount: Math.floor(random() * 90),
      commentCount: Math.floor(random() * 14),
      likedByMe: false,
    };
  });
}

export const FIXTURE_PROFILES: UserProfile[] = FIXTURE_USERS.map((user, index) =>
  buildProfile(user, index, FIXTURE_USERS),
);

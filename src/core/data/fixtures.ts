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

import type {
  ConversationSummary,
  MeDashboard,
  MomentPost,
  PromoBanner,
  RoomCategory,
  RoomSummary,
  UserBadge,
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

const DISPLAY_NAMES = [
  'Maya K.',
  'Leo',
  'ليان',
  'Ivy',
  'عبدالله',
  'Noah',
  'نورة',
  'Theo',
  'سارة',
  'Milo',
  'فهد',
  'Zara',
  'ريم',
  'Kenji',
  'خالد',
  'Amara',
  'هيا',
  'Diego',
  'لمى',
  'Yusuf',
  'دانة',
  'Priya',
  'منال',
  'Oskar',
] as const;

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

function buildUsers(count: number): UserSummary[] {
  const random = createRandom(20261018);
  return Array.from({ length: count }, (_, index) => {
    const level = 1 + Math.floor(random() * 60);
    return {
      id: `user-${index + 1}`,
      displayName: DISPLAY_NAMES[index % DISPLAY_NAMES.length] as string,
      status: pick(random, STATUS_LINES),
      locale: pick(random, LOCALES),
      level,
      badges: ['level', ...pickSome(random, BADGE_POOL, 2)].slice(0, 3) as UserBadge[],
      isOnline: random() > 0.45,
    };
  });
}

function buildRooms(count: number): RoomSummary[] {
  const random = createRandom(777001);
  const categories: RoomCategory[] = ['chat', 'families', 'video'];
  return Array.from({ length: count }, (_, index) => {
    const category = pick(random, categories);
    return {
      id: `room-${index + 1}`,
      name: pick(random, ROOM_NAMES),
      description: pick(random, ROOM_DESCRIPTIONS),
      hostName: pick(random, HOST_NAMES),
      hostLevel: 1 + Math.floor(random() * 60),
      category,
      participantCount: Math.floor(random() * 480),
      country: pick(random, LOCALES),
      language: random() > 0.5 ? 'ar' : 'en',
      tags: pickSome(random, ROOM_TAGS, 2),
    };
  });
}

function buildConversations(count: number): ConversationSummary[] {
  const random = createRandom(31337);
  return Array.from({ length: count }, (_, index) => ({
    id: `conversation-${index + 1}`,
    peerId: `user-${((index * 3) % 24) + 1}`,
    peerName: DISPLAY_NAMES[(index * 5) % DISPLAY_NAMES.length] as string,
    snippet: pick(random, CONVERSATION_SNIPPETS),
    lastMessageAt: new Date(NOW - Math.floor(random() * 5 * DAY)).toISOString(),
    unreadCount: random() > 0.6 ? 1 + Math.floor(random() * 9) : 0,
    isOnline: random() > 0.5,
  }));
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
    return {
      id: `moment-${index + 1}`,
      authorId: author.id,
      authorName: author.displayName,
      authorLevel: author.level,
      badges: author.badges,
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
export const FIXTURE_CONVERSATIONS = buildConversations(14);
export const FIXTURE_MOMENTS = buildMoments(FIXTURE_USERS, 10);

export const FIXTURE_BANNERS: PromoBanner[] = BANNERS;

export const FIXTURE_ME: MeDashboard = {
  userId: 'user-me',
  displayName: 'My Account',
  handle: '@myaccount',
  followingCount: 128,
  fansCount: 42,
  followersCount: 311,
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

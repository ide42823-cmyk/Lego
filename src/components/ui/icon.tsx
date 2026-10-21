import AudioLines from 'lucide-react-native/icons/audio-lines';
import Award from 'lucide-react-native/icons/award';
import Backpack from 'lucide-react-native/icons/backpack';
import BadgeCheck from 'lucide-react-native/icons/badge-check';
import Bell from 'lucide-react-native/icons/bell';
import Briefcase from 'lucide-react-native/icons/briefcase';
import Cake from 'lucide-react-native/icons/cake';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import Camera from 'lucide-react-native/icons/camera';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import Circle from 'lucide-react-native/icons/circle';
import Cloud from 'lucide-react-native/icons/cloud';
import Flower from 'lucide-react-native/icons/flower';
import Funnel from 'lucide-react-native/icons/funnel';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import Clock from 'lucide-react-native/icons/clock';
import Coins from 'lucide-react-native/icons/coins';
import Copy from 'lucide-react-native/icons/copy';
import Crown from 'lucide-react-native/icons/crown';
import Dices from 'lucide-react-native/icons/dices';
import Ellipsis from 'lucide-react-native/icons/ellipsis';
import Flame from 'lucide-react-native/icons/flame';

import Gem from 'lucide-react-native/icons/gem';
import Gift from 'lucide-react-native/icons/gift';
import Globe from 'lucide-react-native/icons/globe';
import Headset from 'lucide-react-native/icons/headset';
import Heart from 'lucide-react-native/icons/heart';
import HeartHandshake from 'lucide-react-native/icons/heart-handshake';
import House from 'lucide-react-native/icons/house';
import Inbox from 'lucide-react-native/icons/inbox';
import ListChecks from 'lucide-react-native/icons/list-checks';
import MapPin from 'lucide-react-native/icons/map-pin';
import Mars from 'lucide-react-native/icons/mars';
import Menu from 'lucide-react-native/icons/menu';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import MessageSquare from 'lucide-react-native/icons/message-square';
import Mic from 'lucide-react-native/icons/mic';
import Orbit from 'lucide-react-native/icons/orbit';
import PartyPopper from 'lucide-react-native/icons/party-popper';
import Phone from 'lucide-react-native/icons/phone';
import Radio from 'lucide-react-native/icons/radio';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Ruler from 'lucide-react-native/icons/ruler';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
import Share2 from 'lucide-react-native/icons/share-2';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Sparkles from 'lucide-react-native/icons/sparkles';
import SquarePlus from 'lucide-react-native/icons/square-plus';
import Star from 'lucide-react-native/icons/star';
import Store from 'lucide-react-native/icons/store';
import ThumbsUp from 'lucide-react-native/icons/thumbs-up';
import Ticket from 'lucide-react-native/icons/ticket';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import Trophy from 'lucide-react-native/icons/trophy';
import UserPlus from 'lucide-react-native/icons/user-plus';
import UserRound from 'lucide-react-native/icons/user-round';
import Users from 'lucide-react-native/icons/users';
import UsersRound from 'lucide-react-native/icons/users-round';
import Venus from 'lucide-react-native/icons/venus';
import Video from 'lucide-react-native/icons/video';
import WavesHorizontal from 'lucide-react-native/icons/waves-horizontal';
import Weight from 'lucide-react-native/icons/weight';
import X from 'lucide-react-native/icons/x';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

/**
 * The app's icon vocabulary.
 *
 * Screens name an icon by *meaning* ("search", "greeting") rather than by
 * glyph, so the underlying set can be swapped without touching a single screen.
 * The set is Lucide (ISC licensed) — a thin-stroke outline family that matches
 * the reference visual language without reproducing the reference app's
 * proprietary iconography.
 *
 * Icons are imported one file at a time from Lucide's `./icons/*` export rather
 * than from the package root. The root module is a single 250 kB index of ~1,700
 * icons, and at the time of writing it also re-exports files its own dist does
 * not ship (`waves.mjs`, `smile.mjs`), which makes it unresolvable in Metro.
 * Per-icon imports pull in only what is used *and* only files proven to exist.
 *
 * To add an icon: find the kebab-case file name on lucide.dev, import it here,
 * and add a meaning to `IconName` and `ICONS` below. TypeScript checks the
 * import against Lucide's own types, so a renamed icon fails the build.
 */
export type IconName =
  // Primary navigation
  | 'home'
  | 'cloud'
  | 'house'
  | 'moments'
  | 'rooms'
  | 'messages'
  | 'me'
  // Controls
  | 'search'
  | 'filter'
  | 'trophy'
  | 'create'
  | 'camera'
  | 'menu'
  | 'more'
  | 'close'
  | 'back'
  | 'forward'
  | 'expand'
  | 'check'
  | 'refresh'
  | 'alert'
  | 'history'
  // Social and room semantics
  | 'greeting'
  | 'like'
  | 'comment'
  | 'gift'
  | 'coin'
  | 'crown'
  | 'star'
  | 'verified'
  | 'trending'
  | 'flower'
  | 'sparkle'
  | 'globe'
  | 'video'
  | 'mic'
  | 'bell'
  | 'live'
  | 'calendar'
  | 'store'
  | 'backpack'
  | 'tasks'
  | 'friends'
  | 'family'
  | 'games'
  | 'party'
  | 'diamonds'
  | 'ticket'
  | 'inbox'
  | 'level'
  | 'shield'
  | 'birthday'
  | 'female'
  | 'male'
  | 'account'
  | 'visitors'
  | 'rank'
  | 'settings'
  | 'share'
  | 'headset'
  | 'warning'
  // Profile contact and attribute rows
  | 'phone'
  | 'copy'
  | 'height'
  | 'weight'
  | 'occupation'
  | 'address'
  | 'invite';

const ICONS: Record<IconName, LucideIcon> = {
  home: House,
  cloud: Cloud,
  house: House,
  moments: Orbit,
  rooms: AudioLines,
  messages: MessageCircle,
  // The reference's account tab is a plain circle, not a face — the dot badge
  // floats on its rim.
  me: Circle,

  search: Search,
  filter: Funnel,
  trophy: Trophy,
  create: SquarePlus,
  camera: Camera,
  menu: Menu,
  more: Ellipsis,
  close: X,
  back: ChevronLeft,
  forward: ChevronRight,
  expand: ChevronDown,
  check: Check,
  refresh: RefreshCw,
  alert: CircleAlert,
  history: Clock,

  greeting: Heart,
  like: ThumbsUp,
  comment: MessageSquare,
  gift: Gift,
  coin: Coins,
  crown: Crown,
  star: Star,
  verified: BadgeCheck,
  trending: Flame,
  flower: Flower,
  sparkle: Sparkles,
  globe: Globe,
  video: Video,
  mic: Mic,
  bell: Bell,
  live: Radio,
  calendar: CalendarDays,
  store: Store,
  backpack: Backpack,
  tasks: ListChecks,
  friends: Users,
  family: UsersRound,
  games: Dices,
  party: PartyPopper,
  diamonds: Gem,
  ticket: Ticket,
  inbox: Inbox,
  level: Award,
  shield: ShieldCheck,
  birthday: Cake,
  female: Venus,
  male: Mars,
  account: UserRound,
  visitors: WavesHorizontal,
  rank: HeartHandshake,
  settings: Settings,
  share: Share2,
  headset: Headset,
  warning: TriangleAlert,

  phone: Phone,
  copy: Copy,
  height: Ruler,
  weight: Weight,
  occupation: Briefcase,
  address: MapPin,
  invite: UserPlus,
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Lucide's stroke weight. The reference set reads as ~2 at 24px. */
  strokeWidth?: number;
  /** Solid fill, used for selected states (a liked post, the greeting heart). */
  fill?: string;
  /** Accessible label. Omit for decorative icons inside a labelled control. */
  label?: string;
}

/**
 * A single icon. Decorative by default: the surrounding control owns the
 * accessible name, so an icon never adds a second, redundant announcement.
 */
export function Icon({
  name,
  size = 22,
  color = '#111111',
  strokeWidth = 2,
  fill = 'none',
  label,
}: IconProps) {
  const Glyph = ICONS[name];

  // Lucide draws with `react-native-svg`, which forwards props straight to the
  // DOM node on web, where `accessible` is not a valid HTML attribute. So the
  // glyph itself is always hidden, and a labelled icon is wrapped in a view that
  // carries the accessible name.
  const glyph = (
    <Glyph
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      focusable={false}
      aria-hidden
    />
  );

  if (!label) {
    return glyph;
  }

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      {glyph}
    </View>
  );
}

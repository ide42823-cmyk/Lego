import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import { View } from 'react-native';

// Per-icon default imports, one subpath at a time — the same bundle-lean
// pattern the Lucide set used. Every glyph below was verified to exist in the
// installed free pack before being wired here; a missing file fails this build.

import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import AddSquareIcon from '@hugeicons/core-free-icons/AddSquareIcon';
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import AlertCircleIcon from '@hugeicons/core-free-icons/AlertCircleIcon';
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Award01Icon from '@hugeicons/core-free-icons/Award01Icon';
import Backpack01Icon from '@hugeicons/core-free-icons/Backpack01Icon';
import BadgeCheckIcon from '@hugeicons/core-free-icons/BadgeCheckIcon';
import BirthdayCakeIcon from '@hugeicons/core-free-icons/BirthdayCakeIcon';
import Briefcase01Icon from '@hugeicons/core-free-icons/Briefcase01Icon';
import Calendar01Icon from '@hugeicons/core-free-icons/Calendar01Icon';
import Camera01Icon from '@hugeicons/core-free-icons/Camera01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import CircleIcon from '@hugeicons/core-free-icons/CircleIcon';
import CloudIcon from '@hugeicons/core-free-icons/CloudIcon';
import Comment01Icon from '@hugeicons/core-free-icons/Comment01Icon';
import Copy01Icon from '@hugeicons/core-free-icons/Copy01Icon';
import CrownIcon from '@hugeicons/core-free-icons/CrownIcon';
import DollarCircleIcon from '@hugeicons/core-free-icons/DollarCircleIcon';
import EraserIcon from '@hugeicons/core-free-icons/EraserIcon';
import EyeIcon from '@hugeicons/core-free-icons/EyeIcon';
import FilterIcon from '@hugeicons/core-free-icons/FilterIcon';
import FlameIcon from '@hugeicons/core-free-icons/FlameIcon';
import FlowerIcon from '@hugeicons/core-free-icons/FlowerIcon';
import GamepadIcon from '@hugeicons/core-free-icons/GamepadIcon';
import GemIcon from '@hugeicons/core-free-icons/GemIcon';
import GhostIcon from '@hugeicons/core-free-icons/GhostIcon';
import GiftIcon from '@hugeicons/core-free-icons/GiftIcon';
import Globe02Icon from '@hugeicons/core-free-icons/Globe02Icon';
import HandshakeIcon from '@hugeicons/core-free-icons/HandshakeIcon';
import HeartIcon from '@hugeicons/core-free-icons/HeartIcon';
import HistoryIcon from '@hugeicons/core-free-icons/HistoryIcon';
import Home01Icon from '@hugeicons/core-free-icons/Home01Icon';
import Home04Icon from '@hugeicons/core-free-icons/Home04Icon';
import InboxIcon from '@hugeicons/core-free-icons/InboxIcon';
import Image01Icon from '@hugeicons/core-free-icons/Image01Icon';
import LaurelWreathLeft02Icon from '@hugeicons/core-free-icons/LaurelWreathLeft02Icon';
import LaurelWreathRight02Icon from '@hugeicons/core-free-icons/LaurelWreathRight02Icon';
import Location01Icon from '@hugeicons/core-free-icons/Location01Icon';
import LockIcon from '@hugeicons/core-free-icons/LockIcon';
import MarsIcon from '@hugeicons/core-free-icons/MarsIcon';
import Megaphone02Icon from '@hugeicons/core-free-icons/Megaphone02Icon';
import Menu01Icon from '@hugeicons/core-free-icons/Menu01Icon';
import Message01Icon from '@hugeicons/core-free-icons/Message01Icon';
import Mic01Icon from '@hugeicons/core-free-icons/Mic01Icon';
import MoreHorizontalIcon from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import Notification03Icon from '@hugeicons/core-free-icons/Notification03Icon';
import Note01Icon from '@hugeicons/core-free-icons/Note01Icon';
import Orbit01Icon from '@hugeicons/core-free-icons/Orbit01Icon';
import PartyPopperIcon from '@hugeicons/core-free-icons/PartyPopperIcon';
import PencilIcon from '@hugeicons/core-free-icons/PencilIcon';
import PhoneIcon from '@hugeicons/core-free-icons/PhoneIcon';
import PlayListIcon from '@hugeicons/core-free-icons/PlayListIcon';
import PowerOffIcon from '@hugeicons/core-free-icons/PowerOffIcon';
import RadioIcon from '@hugeicons/core-free-icons/RadioIcon';
import RefreshIcon from '@hugeicons/core-free-icons/RefreshIcon';
import RibbonIcon from '@hugeicons/core-free-icons/RibbonIcon';
import RulerIcon from '@hugeicons/core-free-icons/RulerIcon';
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import SecurityCheckIcon from '@hugeicons/core-free-icons/SecurityCheckIcon';
import SentIcon from '@hugeicons/core-free-icons/SentIcon';
import Settings01Icon from '@hugeicons/core-free-icons/Settings01Icon';
import Share08Icon from '@hugeicons/core-free-icons/Share08Icon';
import SmileIcon from '@hugeicons/core-free-icons/SmileIcon';
import SparkleIcon from '@hugeicons/core-free-icons/SparkleIcon';
import StarIcon from '@hugeicons/core-free-icons/StarIcon';
import Store01Icon from '@hugeicons/core-free-icons/Store01Icon';
import Task01Icon from '@hugeicons/core-free-icons/Task01Icon';
import Tick01Icon from '@hugeicons/core-free-icons/Tick01Icon';
import ThumbsUpIcon from '@hugeicons/core-free-icons/ThumbsUpIcon';
import Ticket01Icon from '@hugeicons/core-free-icons/Ticket01Icon';
import TrophyIcon from '@hugeicons/core-free-icons/TrophyIcon';
import UserPlusIcon from '@hugeicons/core-free-icons/UserPlusIcon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import UserMultipleIcon from '@hugeicons/core-free-icons/UserMultipleIcon';
import UserMultiple03Icon from '@hugeicons/core-free-icons/UserMultiple03Icon';
import UserCheck01Icon from '@hugeicons/core-free-icons/UserCheck01Icon';
import VenusIcon from '@hugeicons/core-free-icons/VenusIcon';
import Video01Icon from '@hugeicons/core-free-icons/Video01Icon';
import VoiceIcon from '@hugeicons/core-free-icons/VoiceIcon';
import VolumeOffIcon from '@hugeicons/core-free-icons/VolumeOffIcon';
import WandIcon from '@hugeicons/core-free-icons/WandIcon';
import WeightScaleIcon from '@hugeicons/core-free-icons/WeightScaleIcon';
import WavesIcon from '@hugeicons/core-free-icons/WavesIcon';
import HeadsetIcon from '@hugeicons/core-free-icons/HeadsetIcon';
import GridIcon from '@hugeicons/core-free-icons/GridIcon';
import Car03Icon from '@hugeicons/core-free-icons/Car03Icon';
import IdCardIcon from '@hugeicons/core-free-icons/IdCardIcon';
import CircleQuestionMarkIcon from '@hugeicons/core-free-icons/CircleQuestionMarkIcon';
import IncognitoIcon from '@hugeicons/core-free-icons/IncognitoIcon';
import EyeOffIcon from '@hugeicons/core-free-icons/EyeOffIcon';
import UserBlock01Icon from '@hugeicons/core-free-icons/UserBlock01Icon';
import Door01Icon from '@hugeicons/core-free-icons/Door01Icon';

/**
 * The app's icon vocabulary.
 *
 * Screens name an icon by *meaning* ("search", "greeting") rather than by
 * glyph, so the underlying set can be swapped without touching a single
 * screen — this file is now the Hugeicons (stroke-rounded) set while the API
 * stays untouched. The free pack is ISC-style licensed and matches the
 * reference's thin-stroke visual language without reproducing its proprietary
 * iconography.
 *
 * Icons are imported one subpath at a time from
 * `@hugeicons/core-free-icons/<Name>` rather than from the package root: the
 * root barrel re-exports all 6,000+ icons, which Metro would bundle in full.
 *
 * To add an icon: pick the name on hugeicons.com, import its subpath here
 * (verified against the installed pack first), and add a meaning to
 * `IconName` and `ICONS`. TypeScript checks the import against the pack's own
 * types, so a missing icon fails the build.
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
| 'heart'
  | 'comment'
  | 'gift'
  | 'coin'
  | 'crown'
  | 'star'
  | 'verified'
  | 'trending'
  | 'flower'
  | 'sparkle'
  | 'laurel-left'
  | 'laurel-right'
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
  | 'image'
  | 'copy'
  | 'send'
  | 'smile'
  | 'height'
  | 'weight'
  | 'occupation'
  | 'address'
  // Room shell
  | 'power'
  | 'plus'
  | 'lock'
  | 'pencil'
  | 'apps'
  | 'megaphone'
  | 'invite'
  // Room tools drawer
  | 'mute'
  | 'music-list'
  | 'effects'
  | 'clear-screen'
  // Membership benefit matrix
  | 'eye'
  | 'user-check'
  | 'ribbon'
  | 'ghost'
  | 'records'
  // Aristocracy privilege matrix
  | 'vehicle'
  | 'id-card'
  | 'help'
  | 'incognito'
  | 'eye-off'
  | 'user-block'
  | 'door';

const ICONS: Record<IconName, IconSvgElement> = {
  home: Home01Icon,
  cloud: CloudIcon,
  house: Home04Icon,
  moments: Orbit01Icon,
  rooms: VoiceIcon,
  messages: Message01Icon,
  // The reference's account tab is a plain circle, not a face — the dot badge
  // floats on its rim.
  me: CircleIcon,

  search: Search01Icon,
  filter: FilterIcon,
  trophy: TrophyIcon,
  create: AddSquareIcon,
  camera: Camera01Icon,
  menu: Menu01Icon,
  more: MoreHorizontalIcon,
  close: Cancel01Icon,
  back: ArrowLeft01Icon,
  forward: ArrowRight01Icon,
  expand: ArrowDown01Icon,
  check: Tick01Icon,
  refresh: RefreshIcon,
  alert: AlertCircleIcon,
  history: HistoryIcon,

  greeting: HeartIcon,
  like: ThumbsUpIcon,
  heart: HeartIcon,
  comment: Comment01Icon,
  gift: GiftIcon,
  coin: DollarCircleIcon,
  crown: CrownIcon,
  star: StarIcon,
  verified: BadgeCheckIcon,
  trending: FlameIcon,
  flower: FlowerIcon,
  sparkle: SparkleIcon,
  'laurel-left': LaurelWreathLeft02Icon,
  'laurel-right': LaurelWreathRight02Icon,
  globe: Globe02Icon,
  video: Video01Icon,
  mic: Mic01Icon,
  bell: Notification03Icon,
  live: RadioIcon,
  calendar: Calendar01Icon,
  store: Store01Icon,
  backpack: Backpack01Icon,
  tasks: Task01Icon,
  friends: UserMultipleIcon,
  // Friends and family stay two different glyphs in the free pack's user set.
  family: UserMultiple03Icon,
  games: GamepadIcon,
  party: PartyPopperIcon,
  diamonds: GemIcon,
  ticket: Ticket01Icon,
  inbox: InboxIcon,
  level: Award01Icon,
  shield: SecurityCheckIcon,
  birthday: BirthdayCakeIcon,
  female: VenusIcon,
  male: MarsIcon,
  account: UserIcon,
  visitors: WavesIcon,
  rank: HandshakeIcon,
  settings: Settings01Icon,
  share: Share08Icon,
  headset: HeadsetIcon,
  warning: Alert02Icon,

  phone: PhoneIcon,
  image: Image01Icon,
  copy: Copy01Icon,
  send: SentIcon,
  smile: SmileIcon,
  height: RulerIcon,
  weight: WeightScaleIcon,
  occupation: Briefcase01Icon,
  address: Location01Icon,
  power: PowerOffIcon,
  plus: Add01Icon,
  lock: LockIcon,
  pencil: PencilIcon,
  apps: GridIcon,
  megaphone: Megaphone02Icon,
  invite: UserPlusIcon,
  // Hugeicons' own `MuteIcon` is a silent-face smiley, not a volume control;
  // the drawer's Room Mute reads as the muted speaker like the reference.
  mute: VolumeOffIcon,
  'music-list': PlayListIcon,
  effects: WandIcon,
  'clear-screen': EraserIcon,
  eye: EyeIcon,
  'user-check': UserCheck01Icon,
  ribbon: RibbonIcon,
  ghost: GhostIcon,
  records: Note01Icon,
  vehicle: Car03Icon,
  'id-card': IdCardIcon,
  help: CircleQuestionMarkIcon,
  incognito: IncognitoIcon,
  'eye-off': EyeOffIcon,
  'user-block': UserBlock01Icon,
  door: Door01Icon,
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Stroke weight. The reference set reads as ~2 at 24px. */
  strokeWidth?: number;
  /** Solid fill, used for selected states (a liked post, the greeting heart). */
  fill?: string;
  /** Accessible label. Omit for decorative icons inside a labelled control. */
  label?: string;
}

/**
 * A single icon. Decorative by default: the surrounding control owns the
 * accessible name, so an icon never adds a second, redundant announcement.
 *
 * Hugeicons draws with `react-native-svg` and forwards unknown props to the
 * SVG root, where `accessible` is not a valid web attribute. So the glyph
 * itself is always hidden, and a labelled icon is wrapped in a view that
 * carries the accessible name. Calling a `fill` flips the SVG root fill — the
 * free pack is stroke-only, so identity glyphs (hearts, crowns, gift) read as
 * their familiar solid states through the caller's own palette color.
 */
export function Icon({
  name,
  size = 22,
  color = '#111111',
  strokeWidth = 2.25,
  fill = 'none',
  label,
}: IconProps) {
  const glyph = (
    <HugeiconsIcon
      icon={ICONS[name]}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
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

/**
 * Human-readable room labels.
 *
 * Shared by the room card (what the member reads) and the search fields (what
 * the member can type). Keeping one map means searching "Families" finds the
 * rooms whose chip says "Families" — the haystack cannot drift from the card.
 */

import type { RoomBadge, RoomCategory } from './data/types';

export const ROOM_CATEGORY_LABELS: Record<RoomCategory, string> = {
  chat: 'Chat',
  families: 'Families',
  friendship: 'Friendship',
  video: 'Video',
};

export const ROOM_BADGE_LABELS: Record<RoomBadge, string> = {
  official: 'Official',
  featured: 'Featured',
  trending: 'Trending',
};

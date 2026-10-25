import { Image } from 'expo-image';
import { View } from 'react-native';

import { imageSource } from '@/core/media/images';

/**
 * The project owner's VIP1-VIP16 crown badges, supplied as one 4 x 4 sheet.
 *
 * The sheet's cells are 384 x 256, so the component draws the whole sheet four
 * times the badge's width and offsets it to the requested rung's cell. That
 * keeps a single bundled asset while every rung shows its own badge, exactly as
 * the reference draws them in the hero and in the benefit tiles.
 */
const SHEET = 'asset:media/badges/vip-crowns.png';
const COLUMNS = 4;
const ROWS = 4;
/** 384 x 256 cells: the height is two thirds of the width. */
const CELL_RATIO = 256 / 384;

export interface MembershipBadgeProps {
  /** The rung the badge announces, e.g. "VIP7". */
  level: string;
  /** Badge width in points; the cell's ratio fixes the height. */
  width: number;
}

export function MembershipBadge({ level, width }: MembershipBadgeProps) {
  const rung = Number.parseInt(level.replace(/[^0-9]/g, ''), 10);
  const cell = Number.isFinite(rung) ? Math.min(ROWS * COLUMNS, Math.max(1, rung)) - 1 : 0;
  const column = cell % COLUMNS;
  const row = Math.floor(cell / COLUMNS);
  const cellHeight = width * CELL_RATIO;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ width, height: cellHeight, overflow: 'hidden' }}
    >
      <Image
        source={imageSource(SHEET)}
        style={{
          position: 'absolute',
          width: width * COLUMNS,
          height: cellHeight * ROWS,
          left: -column * width,
          top: -row * cellHeight,
        }}
        contentFit="fill"
      />
    </View>
  );
}

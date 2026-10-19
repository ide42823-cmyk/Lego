import { fireEvent, render, screen } from '@testing-library/react-native';

import type { HonorWall } from '@/core/data/types';

import { HonorWallCard } from './profile-honor-wall';

const WALL: HonorWall = {
  key: 'badges',
  title: 'Badges Wall',
  count: 15,
  entries: [{ id: 'honor-1', label: 'VIP2', art: 'crown', grade: 'A', rarity: 'Rare' }],
  emptySlots: 2,
};

describe('HonorWallCard', () => {
  it('announces the wall, its total, and the way to open it', async () => {
    await render(
      <HonorWallCard wall={WALL} onOpenCollection={jest.fn()} onOpenEntry={jest.fn()} />,
    );

    expect(screen.getByLabelText('Badges Wall. 15 collected. Open all')).toBeTruthy();
  });

  it('opens the full collection from the count, not from the whole wall', async () => {
    const onOpenCollection = jest.fn();
    const onOpenEntry = jest.fn();
    await render(
      <HonorWallCard wall={WALL} onOpenCollection={onOpenCollection} onOpenEntry={onOpenEntry} />,
    );

    fireEvent.press(screen.getByLabelText('Badges Wall. 15 collected. Open all'));

    expect(onOpenCollection).toHaveBeenCalledWith(WALL);
    expect(onOpenEntry).not.toHaveBeenCalled();
  });

  it('announces a graded trophy with its grade and rarity', async () => {
    const onOpenEntry = jest.fn();
    await render(
      <HonorWallCard wall={WALL} onOpenCollection={jest.fn()} onOpenEntry={onOpenEntry} />,
    );

    fireEvent.press(screen.getByLabelText('VIP2, grade A, Rare'));

    expect(onOpenEntry).toHaveBeenCalledWith(WALL.entries[0]);
  });

  it('draws placeholder slots that carry no accessible name', async () => {
    await render(
      <HonorWallCard wall={WALL} onOpenCollection={jest.fn()} onOpenEntry={jest.fn()} />,
    );

    // The slot is visible, but it is not a control and is hidden from AT, so a
    // screen reader never announces "Empty" as something to press.
    expect(screen.getAllByText('Empty')).toHaveLength(2);
    expect(screen.queryByLabelText('Empty')).toBeNull();
  });
});

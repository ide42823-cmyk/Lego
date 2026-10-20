import { fireEvent, render, screen } from '@testing-library/react-native';

import type { HonorWall } from '@/core/data/types';

import { HonorWallCard } from './profile-honor-wall';

const BADGES: HonorWall = {
  key: 'badges',
  title: 'Badges Wall',
  count: 15,
  entries: [{ id: 'honor-1', label: 'VIP2', art: 'crown', grade: 'A', rarity: 'Rare' }],
  emptySlots: 2,
};

const TITLES: HonorWall = {
  key: 'titles',
  title: 'Titles Wall',
  count: 1,
  entries: [{ id: 'honor-title-1', label: 'Golden Voice', art: 'trophy' }],
  emptySlots: 2,
};

const GIFTS: HonorWall = {
  key: 'gifts',
  title: 'Gifts Honor Wall',
  count: 268,
  entries: [{ id: 'honor-gift-1', label: 'Cloud Palace', art: 'gem', grade: 'A', rarity: 'Rare' }],
};

describe('HonorWallCard', () => {
  it('announces the wall, its total, and the way to open it', async () => {
    await render(
      <HonorWallCard wall={BADGES} onOpenCollection={jest.fn()} onOpenEntry={jest.fn()} />,
    );

    expect(screen.getByLabelText('Badges Wall. 15 collected. Open all')).toBeTruthy();
  });

  it('opens the full collection from the count, not from the whole wall', async () => {
    const onOpenCollection = jest.fn();
    const onOpenEntry = jest.fn();
    await render(
      <HonorWallCard wall={BADGES} onOpenCollection={onOpenCollection} onOpenEntry={onOpenEntry} />,
    );

    fireEvent.press(screen.getByLabelText('Badges Wall. 15 collected. Open all'));

    expect(onOpenCollection).toHaveBeenCalledWith(BADGES);
    expect(onOpenEntry).not.toHaveBeenCalled();
  });

  it('announces a graded trophy with its grade and rarity', async () => {
    const onOpenEntry = jest.fn();
    await render(
      <HonorWallCard wall={BADGES} onOpenCollection={jest.fn()} onOpenEntry={onOpenEntry} />,
    );

    fireEvent.press(screen.getByLabelText('VIP2, grade A, Rare'));

    expect(onOpenEntry).toHaveBeenCalledWith(BADGES.entries[0]);
  });

  it('draws placeholder slots that carry no accessible name', async () => {
    await render(
      <HonorWallCard wall={BADGES} onOpenCollection={jest.fn()} onOpenEntry={jest.fn()} />,
    );

    // The slots are visible, but they are not controls and are hidden from AT, so
    // a screen reader never announces an empty slot as something to press.
    expect(screen.getAllByTestId('honor-empty-slot', { includeHiddenElements: true })).toHaveLength(
      2,
    );
    expect(screen.queryByLabelText('Empty')).toBeNull();
  });

  it('renders a held title as its own control, with no grade claim', async () => {
    const onOpenEntry = jest.fn();
    await render(
      <HonorWallCard wall={TITLES} onOpenCollection={jest.fn()} onOpenEntry={onOpenEntry} />,
    );

    fireEvent.press(screen.getByLabelText('Golden Voice'));

    expect(onOpenEntry).toHaveBeenCalledWith(TITLES.entries[0]);
  });

  it('keeps unfilled title slots out of the accessibility tree', async () => {
    await render(
      <HonorWallCard wall={TITLES} onOpenCollection={jest.fn()} onOpenEntry={jest.fn()} />,
    );

    expect(screen.getAllByTestId('honor-empty-slot', { includeHiddenElements: true })).toHaveLength(
      2,
    );
  });

  it('announces a gift by name, grade and rarity', async () => {
    const onOpenEntry = jest.fn();
    await render(
      <HonorWallCard wall={GIFTS} onOpenCollection={jest.fn()} onOpenEntry={onOpenEntry} />,
    );

    fireEvent.press(screen.getByLabelText('Cloud Palace, grade A, Rare'));

    expect(onOpenEntry).toHaveBeenCalledWith(GIFTS.entries[0]);
  });
});

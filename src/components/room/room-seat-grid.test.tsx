import { fireEvent, render, screen } from '@testing-library/react-native';

import type { RoomSeat } from '@/core/data/types';

import { RoomSeatGrid } from './room-seat-grid';

const seats: RoomSeat[] = Array.from({ length: 10 }, (_, position) => {
  const index = position + 1;
  if (index === 2) return { index, status: 'locked', contribution: 0 };
  if (index === 5) {
    return { index, status: 'occupied', avatarUrl: 'p5', contribution: 0 };
  }
  return { index, status: 'open', contribution: 0 };
});

describe('RoomSeatGrid', () => {
  it('lays out all ten numbered seats in fixture order', async () => {
    await render(<RoomSeatGrid seats={seats} onPressSeat={jest.fn()} />);

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByLabelText('Seat 5 is taken')).toBeTruthy();
    expect(screen.getByLabelText('Seat 2 is reserved')).toBeTruthy();
  });

  it('reports a seat press to the owner', async () => {
    const onPressSeat = jest.fn();
    await render(<RoomSeatGrid seats={seats} onPressSeat={onPressSeat} />);

    await fireEvent.press(screen.getByLabelText('Take seat 3'));

    expect(onPressSeat).toHaveBeenCalledWith(3);
  });
});

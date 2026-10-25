import { fireEvent, render, screen } from '@testing-library/react-native';

import type { MomentPost } from '@/core/data/types';

import { MomentCard } from './moment-card';

const NOW = Date.now();

const POST: MomentPost = {
  id: 'moment-1',
  authorId: 'user-3',
  authorName: 'Maya',
  authorVipTier: 2,
  authorLevel: 15,
  authorAge: 30,
  authorGender: 'female',
  badges: ['level'],
  text: 'Trying the new room format tonight.',
  hashtag: 'Love',
  hasMedia: true,
  authorOnline: true,
  distanceKm: 12.34,
  createdAt: new Date(NOW - 5 * 60_000).toISOString(),
  likeCount: 14,
  commentCount: 2,
  likedByMe: false,
};

describe('MomentCard', () => {
  it('stamps the post with its age and the author’s bucketed distance', async () => {
    await render(<MomentCard post={POST} />);

    expect(screen.getByText('5 minutes ago · 12.3km')).toBeTruthy();
  });

  it('drops the distance when the author has none', async () => {
    await render(<MomentCard post={{ ...POST, distanceKm: undefined }} />);

    expect(screen.getByText('5 minutes ago')).toBeTruthy();
    expect(screen.queryByText(/km/)).toBeNull();
  });

  it('hides a zero like and comment count but keeps the like reachable', async () => {
    await render(<MomentCard post={{ ...POST, likeCount: 0, commentCount: 0 }} />);

    expect(screen.queryByText('0')).toBeNull();
    // The control still states the count for a screen reader.
    expect(screen.getByLabelText('Like. 0 likes')).toBeTruthy();
  });

  it('offers the greeting only when the feed wires it', async () => {
    const onGreet = jest.fn();
    const view = await render(<MomentCard post={POST} onGreet={onGreet} />);

    await fireEvent.press(view.getByLabelText('Say hi to Maya'));
    expect(onGreet).toHaveBeenCalledWith('user-3');

    // A member's profile already carries the sticky Say hi bar, so the card
    // must not print a second greeting there.
    const bare = await render(<MomentCard post={POST} />);
    expect(bare.queryByLabelText('Say hi to Maya')).toBeNull();
  });

  it('reports the opposite of the current like state', async () => {
    const onToggleLike = jest.fn();
    const view = await render(<MomentCard post={POST} onToggleLike={onToggleLike} />);

    await fireEvent.press(view.getByLabelText('Like. 14 likes'));
    expect(onToggleLike).toHaveBeenCalledWith('moment-1', true);

    const liked = await render(
      <MomentCard post={{ ...POST, likedByMe: true }} onToggleLike={onToggleLike} />,
    );
    await fireEvent.press(liked.getByLabelText('Like. 14 likes'));
    expect(onToggleLike).toHaveBeenLastCalledWith('moment-1', false);
  });

  it('opens the author from the header, never the greeting', async () => {
    const onOpenAuthor = jest.fn();
    const onGreet = jest.fn();
    const view = await render(
      <MomentCard post={POST} onOpenAuthor={onOpenAuthor} onGreet={onGreet} />,
    );

    await fireEvent.press(view.getByLabelText('Maya. Open profile'));

    expect(onOpenAuthor).toHaveBeenCalledWith('user-3');
    expect(onGreet).not.toHaveBeenCalled();
  });

  it('prints the hashtag as a topic pill', async () => {
    await render(<MomentCard post={POST} />);

    expect(screen.getByText('#')).toBeTruthy();
    expect(screen.getByText('Love')).toBeTruthy();
  });
});

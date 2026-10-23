import { fireEvent, render } from '@testing-library/react-native';

import { RoomToolsDrawer } from './room-tools-drawer';
const sections = [
  {
    id: 'section-games',
    title: 'Interactive Games',
    tools: [
      { id: 'game-lucky-bag', label: 'Lucky Bag', icon: 'gift' as const, action: 'backend' as const },
      {
        id: 'game-throne-expedition',
        label: 'Throne Expedition',
        icon: 'games' as const,
        dot: true,
        action: 'backend' as const,
      },
    ],
  },
  {
    id: 'section-basics',
    title: 'Basic Tools',
    tools: [
      { id: 'tool-share', label: 'Share', icon: 'share' as const, action: 'backend' as const },
      {
        id: 'tool-clear-screen',
        label: 'Clear Screen',
        icon: 'clear-screen' as const,
        action: 'clear-screen' as const,
      },
    ],
  },
];

const handlers = {
  onClose: jest.fn(),
  onBackendTool: jest.fn(),
  onClearScreen: jest.fn(),
};

describe('RoomToolsDrawer', () => {
  it('lays out the games and tools sections over the room', async () => {
    const view = await render(
      <RoomToolsDrawer
        visible
        sections={sections}
        composerHeight={84}
        {...handlers}
      />,
    );

    expect(view.queryByText('Interactive Games')).toBeTruthy();
    expect(view.queryByText('Basic Tools')).toBeTruthy();
    expect(view.queryByText('Lucky Bag')).toBeTruthy();
    expect(view.queryByText('Clear Screen')).toBeTruthy();
  });

  it('routes server-backed tools to the gate and Clear Screen to its owner', async () => {
    const view = await render(
      <RoomToolsDrawer
        visible
        sections={sections}
        composerHeight={84}
        {...handlers}
      />,
    );

    await fireEvent.press(view.getByLabelText('Share'));
    expect(handlers.onBackendTool).toHaveBeenCalledTimes(1);
    expect(handlers.onBackendTool.mock.calls[0]?.[0]).toMatchObject({ id: 'tool-share' });

    await fireEvent.press(view.getByLabelText('Clear Screen'));
    expect(handlers.onClearScreen).toHaveBeenCalledTimes(1);
  });

  it('closes from the exposed room area and renders nothing when closed', async () => {
    const view = await render(
      <RoomToolsDrawer
        visible
        sections={sections}
        composerHeight={84}
        {...handlers}
      />,
    );

    await fireEvent.press(view.getByLabelText('Close the tools'));
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });
});

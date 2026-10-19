import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ProfileInfoRow as ProfileInfoRowData } from '@/core/data/types';

import { ProfileInfoRow } from './profile-info-row';

const COPYABLE: ProfileInfoRowData = {
  key: 'id',
  icon: 'id',
  text: 'ID 231550358',
  copyable: true,
  copyValue: '231550358',
};

const PLAIN: ProfileInfoRowData = { key: 'height', icon: 'height', text: 'Height 165cm' };

describe('ProfileInfoRow', () => {
  it('renders the whole line, label and value together', async () => {
    await render(<ProfileInfoRow row={PLAIN} />);

    expect(screen.getByText('Height 165cm')).toBeTruthy();
  });

  it('offers copy only for a copyable row', async () => {
    const onCopy = jest.fn();
    await render(<ProfileInfoRow row={PLAIN} onCopy={onCopy} />);

    expect(screen.queryByLabelText(/^Copy /)).toBeNull();
  });

  it('names the copy control after what it copies', async () => {
    const onCopy = jest.fn();
    await render(<ProfileInfoRow row={COPYABLE} onCopy={onCopy} />);

    fireEvent.press(screen.getByLabelText('Copy ID 231550358'));

    expect(onCopy).toHaveBeenCalledWith(COPYABLE);
  });

  it('withholds the copy control when no handler is supplied', async () => {
    // A control with nothing behind it would be a dead end, which is exactly
    // what the page must not ship.
    await render(<ProfileInfoRow row={COPYABLE} />);

    expect(screen.queryByLabelText('Copy ID 231550358')).toBeNull();
  });
});

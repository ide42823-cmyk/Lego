import { parseAppEnv } from './env';

describe('parseAppEnv', () => {
  it('defaults to development when nothing is configured', () => {
    expect(parseAppEnv({}).environment).toBe('development');
  });

  it('reads a valid environment', () => {
    expect(parseAppEnv({ EXPO_PUBLIC_APP_ENV: 'production' }).environment).toBe('production');
  });

  it('trims and returns the API base URL', () => {
    expect(
      parseAppEnv({ EXPO_PUBLIC_API_BASE_URL: '  https://api.example.com  ' }).apiBaseUrl,
    ).toBe('https://api.example.com');
  });

  it('treats blank values as absent', () => {
    expect(parseAppEnv({ EXPO_PUBLIC_API_BASE_URL: '   ' }).apiBaseUrl).toBeNull();
    expect(parseAppEnv({ EXPO_PUBLIC_APP_ENV: '   ' }).environment).toBe('development');
  });

  it('throws on an unknown environment', () => {
    expect(() => parseAppEnv({ EXPO_PUBLIC_APP_ENV: 'staging' })).toThrow(
      /Invalid EXPO_PUBLIC_APP_ENV/,
    );
  });
});

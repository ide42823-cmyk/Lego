/**
 * Environment configuration.
 *
 * Only `EXPO_PUBLIC_*` variables are reachable from app code. Anything secret
 * belongs on the backend, never in the bundle. This module validates the
 * public configuration once at import time so misconfiguration fails loudly
 * instead of surfacing as a confusing runtime bug later.
 */

export type AppEnvironment = 'development' | 'production' | 'test';

export interface AppEnv {
  environment: AppEnvironment;
  /** Backend API base URL, or null while no backend exists. */
  apiBaseUrl: string | null;
  /**
   * LiveKit WebSocket URL used to prefill the dev RTC spike screen, or null.
   * Tokens are deliberately NOT read from env: they are short-lived and are
   * minted per session, never bundled.
   */
  livekitUrl: string | null;
}

const APP_ENVIRONMENTS: readonly AppEnvironment[] = ['development', 'production', 'test'];

function normalize(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Parse and validate app configuration from an environment-like source.
 * @throws if `EXPO_PUBLIC_APP_ENV` is present but not a known value.
 */
export function parseAppEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const rawEnvironment = normalize(source.EXPO_PUBLIC_APP_ENV);
  const environment = rawEnvironment ?? 'development';

  if (!APP_ENVIRONMENTS.includes(environment as AppEnvironment)) {
    throw new Error(
      `Invalid EXPO_PUBLIC_APP_ENV "${environment}". Expected one of: ${APP_ENVIRONMENTS.join(', ')}.`,
    );
  }

  return {
    environment: environment as AppEnvironment,
    apiBaseUrl: normalize(source.EXPO_PUBLIC_API_BASE_URL) ?? null,
    livekitUrl: normalize(source.EXPO_PUBLIC_LIVEKIT_URL) ?? null,
  };
}

export const env: AppEnv = parseAppEnv();

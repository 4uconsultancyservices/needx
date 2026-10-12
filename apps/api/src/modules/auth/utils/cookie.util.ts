export const ACCESS_TOKEN_COOKIE = 'needx_access_token';
export const REFRESH_TOKEN_COOKIE = 'needx_refresh_token';

/** Socket.IO handshakes carry cookies as a raw header string — parse just what we need. */
export function extractAccessTokenFromCookieHeader(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
}

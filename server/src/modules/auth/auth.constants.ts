import type { CookieOptions, Response } from 'express';
import { env } from '../../config/env';

export const AUTH_COOKIE = 'token';

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

function cookieOptions(): CookieOptions {
  // Cross-origin SPA (e.g. Vercel) + API host needs SameSite=None; Secure.
  const crossSite = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: sevenDaysMs,
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, cookieOptions());
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });
}

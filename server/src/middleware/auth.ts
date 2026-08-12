import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AUTH_COOKIE } from '../modules/auth/auth.constants';
import { AppError } from './errorHandler';

interface TokenPayload {
  userId: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
  if (!token) {
    next(new AppError(401, 'Not authenticated'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
export function requireAuthInnerRoutes(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(new AppError(401, 'Authentication required'));
      return;
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: SEVEN_DAYS_SECONDS });
}

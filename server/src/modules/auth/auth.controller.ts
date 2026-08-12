import type { Request, Response } from 'express';
import { signToken } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { clearAuthCookie, setAuthCookie } from './auth.constants';
import * as authService from './auth.service';
import { loginSchema, signupSchema } from './auth.validation';

export async function signup(req: Request, res: Response): Promise<void> {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const user = await authService.signup(parsed.data);
  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const user = await authService.login(parsed.data);
  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.json({ user, token });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.userId!);
  res.json({ user });
}

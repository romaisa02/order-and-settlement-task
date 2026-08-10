import type { Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import * as userService from './user.service';
import { updateProfileSchema } from './user.validation';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userService.getProfile(req.userId!);
  res.json({ user });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const user = await userService.updateProfile(req.userId!, parsed.data);
  res.json({ user });
}

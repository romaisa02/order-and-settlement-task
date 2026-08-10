import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import * as userController from './user.controller';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/me', asyncHandler(userController.getMe));
userRouter.patch('/me', asyncHandler(userController.updateMe));

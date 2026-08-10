import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/signup', asyncHandler(authController.signup));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));

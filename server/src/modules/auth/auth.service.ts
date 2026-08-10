import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/errorHandler';
import { toPublicUser, User, type PublicUser } from '../users/user.model';
import type { LoginInput, SignupInput } from './auth.validation';

const SALT_ROUNDS = 10;

export async function signup(input: SignupInput): Promise<PublicUser> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, 'Email is already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  return toPublicUser(user);
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError(401, 'Invalid email or password');
  }

  return toPublicUser(user);
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(401, 'Not authenticated');
  }
  return toPublicUser(user);
}

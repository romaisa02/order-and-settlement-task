import { AppError } from '../../middleware/errorHandler';
import type { UpdateProfileInput } from './user.validation';
import { toPublicUser, User, type PublicUser } from './user.model';

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  if (input.email) {
    const taken = await User.findOne({ email: input.email, _id: { $ne: userId } });
    if (taken) {
      throw new AppError(409, 'Email is already in use');
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: input }, { new: true, runValidators: true });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return toPublicUser(user);
}

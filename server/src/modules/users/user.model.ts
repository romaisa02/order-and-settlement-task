import mongoose, { Schema } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export function toPublicUser(user: { _id: unknown; email: string; name: string }): PublicUser {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
  };
}

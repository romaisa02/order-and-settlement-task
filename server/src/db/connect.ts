import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(env.MONGODB_URI);
    console.error('Failed to connect to MongoDB. Is it running, and is MONGODB_URI correct?');
    throw err;
  }
}

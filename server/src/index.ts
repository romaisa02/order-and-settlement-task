import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { connectDb } from './db/connect';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import orderRoutes from "./modules/orders/order.route";
import { paymentRouter } from './modules/payments/payment.routes';

async function main(): Promise<void> {
  await connectDb();

  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use("/api/orders", orderRoutes);
  app.use('/api/orders', paymentRouter);

  app.use(errorHandler);
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

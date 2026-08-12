import { Router } from 'express';
import { requireAuthInnerRoutes } from '../../middleware/auth';
import { createPayment, getPayments } from './payment.controller';
import validatePayment from './payment.validation';

export const paymentRouter = Router();
paymentRouter.use(requireAuthInnerRoutes);
paymentRouter.post('/:orderId/payments', validatePayment, createPayment);
paymentRouter.get('/:orderId/payments', getPayments);
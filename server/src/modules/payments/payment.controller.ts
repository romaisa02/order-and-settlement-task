import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import * as paymentService from './payment.service';

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
	if (!req.userId) return res.status(401).json({ message: 'Authentication required' });
	const payment = await paymentService.createPayment(req.userId, req.params.orderId, req.body);
	return res.status(201).json(payment);
});

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
	if (!req.userId) return res.status(401).json({ message: 'Authentication required' });
	const payments = await paymentService.getPayments(req.userId, req.params.orderId);
	return res.json(payments);
});
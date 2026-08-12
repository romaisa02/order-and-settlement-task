import mongoose from 'mongoose';
import { AppError } from '../../middleware/errorHandler';
import { Order } from '../orders/order.model';
import { getOrderPaymentSummary } from '../orders/order.status';
import { Payment } from './payment.model';

const userObjectId = (userId: string) => new mongoose.Types.ObjectId(userId);

export async function createPayment(
	userId: string,
	orderId: string,
	data: { amount: number; date: string; note?: string },
) {
	const session = await mongoose.startSession();
	try {
		let result;
		await session.withTransaction(async () => {
			const order = await Order.findOne({ _id: orderId, userId: userObjectId(userId) }).session(session);
			if (!order) throw new AppError(404, 'Order not found');

			const [{ totalPaid: totalPaidBefore = 0 } = {}] = await Payment.aggregate<{ totalPaid: number }>([
				{ $match: { orderId: order._id, userId: userObjectId(userId) } },
				{ $group: { _id: null, totalPaid: { $sum: '$amount' } } },
			]).session(session);
			const summary = getOrderPaymentSummary(order.total, totalPaidBefore, order.dueDate);
			if (data.amount > summary.remainingBalance) {
				throw new AppError(409, 'Payment exceeds the remaining order balance', 'PAYMENT_EXCEEDS_BALANCE', {
					attemptedAmount: data.amount,
					remainingBalance: summary.remainingBalance,
					totalPaid: summary.totalPaid,
					orderTotal: order.total,
				});
			}

			const [payment] = await Payment.create([{ orderId: order._id, userId: userObjectId(userId), ...data, date: new Date(data.date) }], { session });
			const totalPaid = totalPaidBefore + data.amount;
			result = {
				payment,
				order: getOrderPaymentSummary(order.total, totalPaid, order.dueDate),
			};
		});
		return result;
	} finally {
		await session.endSession();
	}
}

export async function getPayments(userId: string, orderId: string) {
	const order = await Order.findOne({ _id: orderId, userId: userObjectId(userId) });
	if (!order) throw new AppError(404, 'Order not found');
	return Payment.find({ orderId: order._id, userId: userObjectId(userId) }).sort({ date: -1 });
}
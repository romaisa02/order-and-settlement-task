export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface OrderPaymentSummary {
	totalPaid: number;
	remainingBalance: number;
	status: OrderStatus;
}

export function getOrderPaymentSummary(
	orderTotal: number,
	totalPaid: number,
	dueDate: Date,
	now = new Date(),
): OrderPaymentSummary {
	const paid = Math.min(totalPaid, orderTotal);
	const remainingBalance = Math.max(0, orderTotal - paid);

	if (remainingBalance === 0) {
		return { totalPaid: paid, remainingBalance, status: 'paid' };
	}

	if (dueDate < now) {
		return { totalPaid: paid, remainingBalance, status: 'overdue' };
	}

	return {
		totalPaid: paid,
		remainingBalance,
		status: paid > 0 ? 'partially_paid' : 'pending',
	};
}
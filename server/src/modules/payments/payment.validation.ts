import type { NextFunction, Request, Response } from 'express';

export default function validatePayment(req: Request, res: Response, next: NextFunction): void {
	const { amount, date, note } = req.body as { amount?: unknown; date?: unknown; note?: unknown };
	if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0.01) {
		res.status(400).json({ message: 'Amount must be a finite number of at least 0.01' });
		return;
	}
	if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
		res.status(400).json({ message: 'Date must be a valid date' });
		return;
	}
	if (note !== undefined && typeof note !== 'string') {
		res.status(400).json({ message: 'Note must be a string' });
		return;
	}
	next();
}
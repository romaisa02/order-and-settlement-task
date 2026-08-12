import mongoose, { Schema, Types } from 'mongoose';

export interface IPayment {
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    date: Date;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        amount: {
            type: Number,
            required: true,
            min: [0.01, 'Payment amount must be at least 0.01'],
            validate: { validator: Number.isFinite, message: 'Payment amount must be finite' },
        },
        date: { type: Date, required: true },
        note: { type: String, trim: true },
    },
    { timestamps: true },
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
import mongoose, { Schema, Types } from 'mongoose';

export interface IOrderLineItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

export interface IOrder {
	userId: mongoose.Types.ObjectId;
	customer: string;
	dueDate: Date;
	lineItems: IOrderLineItem[];
	subtotal: number;
	total: number;
	createdAt: Date;
	updatedAt: Date;
}

const orderLineItemSchema = new Schema<IOrderLineItem>(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		unitPrice: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{ _id: false },
);

const orderSchema = new Schema<IOrder>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		customer: {
			type: String,
			required: true,
			trim: true,
		},
		dueDate: {
			type: Date,
			required: true,
		},
		lineItems: {
			type: [orderLineItemSchema],
			required: true,
			validate: {
				validator: (items: IOrderLineItem[]) => items.length > 0,
				message: 'An order must contain at least one line item',
			},
		},
		subtotal: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
		},
		total: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true },
);

orderSchema.pre('validate', function () {
	this.subtotal = this.lineItems.reduce(
		(sum, item) => sum + item.quantity * item.unitPrice,
		0,
	);
	this.total = this.subtotal;
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);

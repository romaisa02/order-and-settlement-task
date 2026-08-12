import mongoose from "mongoose";
import {Order} from "./order.model";
import {
  CreateOrderInput,
  UpdateOrderInput,
} from "../../types/order";
import { Payment } from "../payments/payment.model";
import { getOrderPaymentSummary } from "./order.status";

const withPaymentSummary = async (order: any, userId: string) => {
  if (!order) return order;
  const [{ totalPaid = 0 } = {}] = await Payment.aggregate<{ totalPaid: number }>([
    { $match: { orderId: order._id, userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
  ]);
  return { ...order.toObject(), ...getOrderPaymentSummary(order.total, totalPaid, order.dueDate) };
};

const calculateSubtotal = (
  lineItems: CreateOrderInput["lineItems"]
): number => {
  return lineItems.reduce(
    (sum, item) => {
      return sum + item.quantity * item.unitPrice;
    },
    0
  );
};

const createOrder = async (
  userId: string,
  data: CreateOrderInput
) => {
    console.log("Creating order for userId:", userId);
  const { customer, dueDate, lineItems } = data;

 // const subtotal = calculateSubtotal(lineItems);
  //  console.log("Creating order for subtotal:", subtotal);

  const order = await Order.create({
    userId: new mongoose.Types.ObjectId(userId),
    customer,
    dueDate,
    lineItems,
    subtotal: 6,
    total: 6,
  });

  return order;
};

const getOrders = async (userId: string) => {
  const orders = await Order.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({
    createdAt: -1,
  });
  return Promise.all(orders.map((order) => withPaymentSummary(order, userId)));
};

const getOrderById = async (
  userId: string,
  orderId: string
) => {
  const order = await Order.findOne({
    _id: orderId,
    userId: new mongoose.Types.ObjectId(userId),
  });
  return withPaymentSummary(order, userId);
};

const updateOrder = async (
  userId: string,
  orderId: string,
  data: UpdateOrderInput
) => {
  const {
    customer,
    dueDate,
    lineItems,
  } = data;

  const subtotal = calculateSubtotal(lineItems);

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      userId: new mongoose.Types.ObjectId(userId),
    },
    {
      customer,
      dueDate,
      lineItems,
      subtotal,
      total: subtotal,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return order;
};

const deleteOrder = async (
  userId: string,
  orderId: string
) => {
  return Order.findOneAndDelete({
    _id: orderId,
    userId: new mongoose.Types.ObjectId(userId),
  });
};

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
import { Request, Response } from "express";

import * as orderService from "./order.service";
import {
  CreateOrderInput,
  UpdateOrderInput,
} from "../../types/order";

const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const data = req.body as CreateOrderInput;

    const order = await orderService.createOrder(
      req.userId,
      data
    );

    res.status(201).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

const getOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const orders = await orderService.getOrders(
      req.userId
    );

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const order = await orderService.getOrderById(
      req.userId,
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get order",
    });
  }
};

const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const data = req.body as UpdateOrderInput;

    const order = await orderService.updateOrder(
      req.userId,
      req.params.id,
      data
    );

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const order = await orderService.deleteOrder(
      req.userId,
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
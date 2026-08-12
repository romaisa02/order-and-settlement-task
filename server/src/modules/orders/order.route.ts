import { Router } from "express";

import validateOrder from "./order.validator";
import { requireAuthInnerRoutes } from '../../middleware/auth';

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "./order.controller";

const router = Router();
router.use(requireAuthInnerRoutes);

router.post(
  "/",
  validateOrder,
  createOrder
);

router.get(
  "/",
  getOrders
);

router.get(
  "/:id",
  getOrderById
);

router.put(
  "/:id",
  validateOrder,
  updateOrder
);

router.delete(
  "/:id",
  deleteOrder
);

export default router;
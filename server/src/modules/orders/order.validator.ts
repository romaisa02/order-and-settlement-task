import { Request, Response, NextFunction } from "express";
import { CreateOrderInput } from "../../types/order"

const validateOrder = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    customer,
    dueDate,
    lineItems,
  } = req.body as CreateOrderInput;

  if (!customer || typeof customer !== "string") {
    res.status(400).json({
      message: "Customer is required",
    });
    return;
  }

  if (!dueDate) {
    res.status(400).json({
      message: "Due date is required",
    });
    return;
  }

  if (Number.isNaN(Date.parse(dueDate))) {
    res.status(400).json({
      message: "Invalid due date",
    });
    return;
  }

  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    res.status(400).json({
      message: "At least one line item is required",
    });
    return;
  }

  for (const item of lineItems) {
    if (
      !item.description ||
      typeof item.description !== "string"
    ) {
      res.status(400).json({
        message: "Description is required",
      });
      return;
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      res.status(400).json({
        message: "Quantity must be an integer >= 1",
      });
      return;
    }

    if (
      typeof item.unitPrice !== "number" ||
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    ) {
      res.status(400).json({
        message: "Unit price must be >= 0",
      });
      return;
    }
  }

  next();
};

export default validateOrder;
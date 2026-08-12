export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  customer: string;
  dueDate: string;
  lineItems: LineItemInput[];
}

export interface UpdateOrderInput {
  customer: string;
  dueDate: string;
  lineItems: LineItemInput[];
}
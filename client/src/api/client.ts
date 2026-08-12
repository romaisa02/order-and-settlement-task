export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface OrderLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  _id: string;
  customer: string;
  total: number;
  dueDate: string;
  status: OrderStatus;
  totalPaid: number;
  remainingBalance: number;
  lineItems: OrderLineItem[];
  subtotal?: number;
  createdAt: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  { bearer = false }: { bearer?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (bearer) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = (await res.json().catch(() => ({}))) as { message?: string };

  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? 'Request failed');
  }

  return data as T;
}

export const api = {
  signup(body: { name: string; email: string; password: string }) {
    return request<{ user: User; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  login(body: { email: string; password: string }) {
    return request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  logout() {
    return request<{ message: string }>('/api/auth/logout', { method: 'POST' });
  },
  me() {
    return request<{ user: User }>('/api/auth/me');
  },
  getProfile() {
    return request<{ user: User }>('/api/users/me');
  },
  updateProfile(body: { name?: string; email?: string }) {
    return request<{ user: User }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  getOrders() {
    return request<Order[]>('/api/orders', {}, { bearer: true });
  },
  getOrderById(id: string) {
    return request<Order>(`/api/orders/${id}`, {}, { bearer: true });
  },
  getOrderPayments(orderId: string) {
    return request<Payment[]>(`/api/orders/${orderId}/payments`, {}, { bearer: true });
  },
};

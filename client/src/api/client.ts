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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
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
    return request<{ user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  login(body: { email: string; password: string }) {
    return request<{ user: User }>('/api/auth/login', {
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
};

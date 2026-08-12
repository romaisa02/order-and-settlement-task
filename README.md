# Signup & login

TypeScript MERN app with email/password auth. Each signed-in user can view and update only their own profile.

## Stack

- **Client:** React + Vite + React Router
- **Server:** Node.js + Express + Mongoose
- **Database:** MongoDB

## Prerequisites

- Node.js 20+
- MongoDB running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Setup

```bash
# API
cp .env.example server/.env
# edit server/.env — set JWT_SECRET and MONGODB_URI
cd server && npm install

# UI
cd ../client && npm install
```

## Run

Use two terminals:

```bash
cd server && npm run dev
```

```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:5000`.

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | cookie set | Create account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | cookie set | Sign in |
| `POST` | `/api/auth/logout` | — | Clear session cookie |
| `GET` | `/api/auth/me` | required | Current user |
| `GET` | `/api/users/me` | required | Own profile |
| `PATCH` | `/api/users/me` | required | Update `name` and/or `email` |
| `POST` | `/api/orders` | required | Create an order |
| `GET` | `/api/orders` | required | List the signed-in user's orders |
| `POST` | `/api/orders/:orderId/payments` | required | Record a payment against an order |
| `GET` | `/api/orders/:orderId/payments` | required | List payments for an order |

The JWT lives in an httpOnly `token` cookie. User id always comes from that token, never from the request body.

## Order status and payments

Order status is derived from payments and the due date. `pending` means no payments have been recorded, `partially_paid` means payments are below the order total, and `paid` means the total has been paid. An unpaid or partially paid order becomes `overdue` after its due date. A fully paid order remains `paid` even when its due date has passed.

Payments require an amount of at least `0.01`, a valid date, and an optional note. Multiple payments are allowed, but their sum cannot exceed the order total. An over-payment returns `409` with code `PAYMENT_EXCEEDS_BALANCE` and includes the remaining balance so the client can correct the amount. Orders and payments are restricted to the authenticated user.

## Extending

Add a feature as `server/src/modules/<name>/` (routes → controller → service → model). Protect routes with `requireAuth` and filter every query by `req.userId`.

# Orders & settlements

TypeScript MERN app with email/password auth, an orders dashboard, and own-profile editing. Each signed-in user can only access their own orders and profile.

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

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:5001`.

## UI

After login, the home page is **Orders**: a table of your orders with customer, status, totals, amounts paid/due, and due date. Status filtering (`all`, `pending`, `partially_paid`, `paid`, `overdue`) happens in the client. Open **Profile** or **Log out** from the top-right user menu.

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | cookie set; returns `token` | Create account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | cookie set; returns `token` | Sign in |
| `POST` | `/api/auth/logout` | — | Clear session cookie |
| `GET` | `/api/auth/me` | cookie | Current user |
| `GET` | `/api/users/me` | cookie | Own profile |
| `PATCH` | `/api/users/me` | cookie | Update `name` and/or `email` |
| `POST` | `/api/orders` | Bearer | Create an order |
| `GET` | `/api/orders` | Bearer | List the signed-in user's orders |
| `POST` | `/api/orders/:orderId/payments` | Bearer | Record a payment against an order |
| `GET` | `/api/orders/:orderId/payments` | Bearer | List payments for an order |

Auth and profile routes use an httpOnly `token` cookie. Orders and payments require `Authorization: Bearer <jwt>`. Login and signup set the cookie and return `{ user, token }` so the client can store the JWT (e.g. in `localStorage`) and send it on order requests. User id always comes from the verified token, never from the request body.

## Order status and payments

Order status is derived from payments and the due date. `pending` means no payments have been recorded, `partially_paid` means payments are below the order total, and `paid` means the total has been paid. An unpaid or partially paid order becomes `overdue` after its due date. A fully paid order remains `paid` even when its due date has passed.

Payments require an amount of at least `0.01`, a valid date, and an optional note. Multiple payments are allowed, but their sum cannot exceed the order total. An over-payment returns `409` with code `PAYMENT_EXCEEDS_BALANCE` and includes the remaining balance so the client can correct the amount. Orders and payments are restricted to the authenticated user.

## Extending

Add a feature as `server/src/modules/<name>/` (routes → controller → service → model). Protect cookie routes with `requireAuth`, Bearer routes with `requireAuthInnerRoutes`, and filter every query by `req.userId`.

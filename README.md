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

## Deployment

The application is deployed with the frontend and backend hosted separately.

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

The repository structure is:

orders-and-settlements/
├── client/    # React + Vite frontend
├── server/    # Node.js + Express + TypeScript backend
└── README.md

Backend Deployment - Render

The backend is deployed as a Render Web Service.

1. Create a Web Service

Create a new Web Service on Render and connect the GitHub repository.

Set the Root Directory to:

server

2. Build Command

npm install && npm run build

3. Start Command

npm start

4. Environment Variables

Configure the environment variables required by the backend in Render.

Example:

MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-jwt-secret>
CLIENT_ORIGIN=<your-vercel-frontend-url>
PORT=10000
NODE_ENV=local|production

Use the exact environment variable names configured in the server application.

After deployment, Render provides a backend URL similar to:

https://your-backend.onrender.com

Frontend Deployment - Vercel

The frontend is deployed separately using Vercel.

1. Import the Repository

Create a new project in Vercel and connect the GitHub repository.

2. Set the Root Directory

Because the frontend is inside the client directory, set:

Root Directory: client

3. Build Settings

Vercel should automatically detect the Vite application.

Use:

Framework Preset: Vite
Build Command: npm run build
Output Directory: dist

The dist directory is generated during the Vercel build and does not need to be committed to Git.

4. Environment Variable

Add the deployed backend URL in Vercel:

VITE_API_URL=https://your-backend.onrender.com

The frontend uses VITE_API_URL to send API requests to the deployed backend.

For example:

const API_URL = import.meta.env.VITE_API_URL;

fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  ...
});

React Router Configuration

If using React Router, add the following file:

client/vercel.json

{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

This ensures routes such as /login, /signup, /orders, and /profile continue to work correctly when the page is refreshed.

CORS

Because the frontend and backend are deployed on different domains, the backend must allow requests from the Vercel frontend.

Configure the frontend URL in Render:

FRONTEND_URL=https://your-frontend.vercel.app

The backend uses this value for its CORS configuration.

Deployment Flow

                    GitHub Repository
                           |
              +------------+------------+
              |                         |
              v                         v
          client/                    server/
              |                         |
              v                         v
           Vercel                    Render
              |                         |
              |                         |
              +------------+------------+
                           |
                           v
                     MongoDB Atlas

Local vs Production

For local development:

VITE_API_URL=http://localhost:5001

For production:

VITE_API_URL=https://your-backend.onrender.com

The same frontend API client uses VITE_API_URL in both environments.

Deployment Checklist

Backend builds successfully with npm run build

Frontend builds successfully with npm run build

MongoDB Atlas is accessible from the deployed backend

Backend environment variables are configured in Render

VITE_API_URL is configured in Vercel

CORS allows the Vercel frontend URL

React Router rewrite is configured in client/vercel.json

Backend and frontend changes are pushed to GitHub


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

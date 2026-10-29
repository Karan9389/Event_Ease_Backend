# ðŸŒŸ EventEasy

### A secure REST API for discovering event vendors, managing selections, and placing event bookings.

EventEasy is a decoupled event-planning platform. This repository contains the Node.js/Express backend that powers authentication, vendor services, carts, wishlists, and booking orders for the EventEasy web client.

## ðŸ”— System Architecture & Companion Repository

EventEasy uses a **decoupled client-server architecture**:

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       HTTPS/REST + JSON       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ EventEasy Frontend           â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¶ â”‚ EventEasy Backend            â”‚
â”‚ React + TypeScript + Vite    â”‚ â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ â”‚ Express + Node.js            â”‚
â”‚ localhost:3000               â”‚                               â”‚ localhost:5000               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                                              â”‚ Mongoose
                                                                              â–¼
                                                                  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                                                  â”‚ MongoDB                  â”‚
                                                                  â”‚ event_ease database      â”‚
                                                                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **Frontend repository:** [EventEasy Frontend](https://github.com/Karan9389/Event_Ease)
- **Backend repository:** [EventEasy Backend](https://github.com/Karan9389/Event_Ease_Backend) â€” this repository

The frontend calls the backend under `http://localhost:5000/api` during local development. Public service discovery endpoints are unauthenticated. User-specific routes require a JWT in the `Authorization` header using the `Bearer JWT` scheme. The frontend stores that token in `localStorage` under `event_ease_token`.

The backend enables CORS for local development. In production, set `ALLOWED_ORIGINS` to a comma-separated allowlist of deployed frontend origins. Express JSON parsing, Helmet security headers, a global rate limiter, Joi request validation, bcrypt password hashing, and centralized error responses are applied at the API boundary.

### API surface

| Area | Endpoint | Methods | Authentication |
|---|---|---|---|
| Health | `/` | `GET` | Public |
| Authentication | `/api/auth/register` | `POST` | Public |
| Authentication | `/api/auth/login` | `POST` | Public |
| Authentication | `/api/auth/me` | `GET` | JWT |
| Services | `/api/services` | `GET` | Public |
| Services | `/api/services/:id` | `GET` | Public |
| Services | `/api/services` | `POST` | JWT |
| Cart | `/api/cart` | `GET`, `POST` | JWT |
| Cart | `/api/cart/clear` | `DELETE` | JWT |
| Cart | `/api/cart/:serviceId` | `DELETE` | JWT |
| Wishlist | `/api/wishlist` | `GET` | JWT |
| Wishlist | `/api/wishlist/toggle` | `POST` | JWT |
| Wishlist | `/api/wishlist/:serviceId` | `DELETE` | JWT |
| Orders | `/api/orders` | `GET`, `POST` | JWT |

For the client-side pages and user experience that consume this API, see the [frontend README](https://github.com/Karan9389/Event_Ease#readme).

## ðŸ›  Tech Stack & Configuration

### Runtime and server

- **Node.js** â€” JavaScript runtime
- **Express 5** â€” HTTP server and routing
- **CommonJS** â€” module format used by the backend
- **MongoDB** â€” document database
- **Mongoose 9** â€” MongoDB connection, schemas, models, and population

### Security, validation, and middleware

- **jsonwebtoken** â€” seven-day JWT creation and verification
- **bcryptjs** â€” password hashing and comparison
- **Joi** â€” request-body validation and unknown-field stripping
- **cors** â€” cross-origin access control
- **helmet** â€” security-related HTTP headers
- **express-rate-limit** â€” global limit of 100 requests per IP per 15 minutes
- **dotenv** â€” environment variable loading

### Environment variables

Create `Event_Ease_Backend/.env` locally. Never commit real secrets.

| Key | Required | Description |
|---|---:|---|
| `PORT` | No | HTTP port. Defaults to `5000`. |
| `MONGO_URI` | No | MongoDB connection string. Defaults to `mongodb://127.0.0.1:27017/event_ease`. |
| `JWT_SECRET` | Yes in production | Secret used to sign and verify JWTs. Development currently permits a fallback but production exits if this key is missing. |
| `NODE_ENV` | No | Set to `production` to enable strict CORS allowlisting and production JWT-secret enforcement. |
| `ALLOWED_ORIGINS` | Production | Comma-separated frontend origins allowed by CORS, for example `https://your-frontend.example.com`. Used when `NODE_ENV=production`. |

The frontend currently has no required environment keys: its `.env.example` is empty and its API base URL is defined in `src/lib/api.ts` as `http://localhost:5000/api`. For a deployed frontend, update that API base URL to the deployed backend origin or introduce a Vite `VITE_*` variable as part of the deployment configuration.

## ðŸ—„ Database Schema & Models

EventEasy uses MongoDB with Mongoose. MongoDB creates the collections from the following models; Mongoose timestamps add `createdAt` and `updatedAt` to each top-level document.

### `users` â€” `User`

- `_id`: ObjectId
- `name`: required trimmed string
- `email`: required, unique, lowercased, trimmed string
- `password`: required hashed string, minimum six characters before hashing
- `cart`: array of ObjectId references to `Service`
- `wishlist`: array of ObjectId references to `Service`
- `createdAt`, `updatedAt`

### `services` â€” `Service`

- `_id`: ObjectId
- `name`: required trimmed string
- `category`: required enum: `photography`, `catering`, `music`, `makeup`
- `description`: required trimmed string
- `price`: required non-negative number
- `originalPrice`: optional non-negative number
- `priceUnit`: optional string such as `/pp` or `/ event`
- `rating`: number from `0` to `5`
- `reviewCount`: non-negative number
- `image`: image URL string
- `tags`: string array
- `location`: string
- `availability`: string, default `available`
- `featured`: boolean
- `createdAt`, `updatedAt`

### `orders` â€” `Order`

- `_id`: ObjectId
- `user`: required ObjectId reference to `User`
- `items`: embedded order-item array containing:
  - `service`: ObjectId reference to `Service`
  - `name`, `category`, `price`, and `image` snapshots
- `subtotal`: sum of item prices
- `tax`: 8% of subtotal, rounded to the nearest whole number
- `total`: subtotal plus tax
- `eventName`: booking name
- `eventDate`: ISO date string
- `status`: `Planning`, `Confirmed`, `Completed`, or `Cancelled`
- `createdAt`, `updatedAt`

### Relationships and lifecycle

1. A `User` references selected `Service` documents through `cart` and `wishlist`.
2. Login and `/api/auth/me` populate those references before returning client-ready service objects.
3. Creating an order records the selected services as embedded snapshots, associates the order with the authenticated user, calculates totals, and clears the userâ€™s cart.
4. Services are seeded on startup only when the `services` collection is empty. The seed includes photography, catering, music, and makeup vendors.

## ðŸ“‚ Project Structure & Working

```text
Event_Ease_Backend/
â”œâ”€â”€ package.json
â”œâ”€â”€ .env                         # Local secrets and connection configuration (not committed)
â””â”€â”€ src/
    â”œâ”€â”€ server.js                # Express app, middleware, routes, MongoDB startup
    â”œâ”€â”€ config/
    â”‚   â””â”€â”€ seed.js              # Default service/vendor seed data
    â”œâ”€â”€ controllers/
    â”‚   â”œâ”€â”€ authControllers.js   # Register, login, current-user lookup
    â”‚   â”œâ”€â”€ serviceControllers.js # Service search, lookup, and creation
    â”‚   â”œâ”€â”€ cartControllers.js
    â”‚   â”œâ”€â”€ wishlistControllers.js
    â”‚   â””â”€â”€ orderControllers.js
    â”œâ”€â”€ lib/
    â”‚   â”œâ”€â”€ errorResponse.js     # Consistent server-error responses
    â”‚   â””â”€â”€ validators.js        # Joi schemas and validation middleware
    â”œâ”€â”€ middleware/
    â”‚   â””â”€â”€ authMiddleware.js    # Bearer-token verification and user loading
    â”œâ”€â”€ models/
    â”‚   â”œâ”€â”€ User.js
    â”‚   â”œâ”€â”€ Service.js
    â”‚   â””â”€â”€ Order.js
    â””â”€â”€ routes/db/
        â”œâ”€â”€ authRoute.js
        â”œâ”€â”€ serviceRoute.js
        â”œâ”€â”€ cartRoute.js
        â”œâ”€â”€ wishlistRoute.js
        â””â”€â”€ orderRoute.js
```

### Request and data flow

1. The React router renders a page such as Home, Cart, Wishlist, or Profile.
2. The frontend API helper sends a JSON request to the matching `/api` route.
3. Express applies CORS, JSON parsing, Helmet, and rate limiting.
4. Protected routes run `authMiddleware`, which verifies the Bearer JWT and loads the user without the password.
5. Joi validates and sanitizes supported request bodies where configured.
6. A controller queries or updates MongoDB through Mongoose models.
7. Mongoose populates service references when the response needs complete vendor data.
8. The controller returns JSON; the frontend updates `AppContext` state for vendors, authentication, cart, wishlist, and orders.
9. If service discovery cannot reach the backend, the frontend can fall back to its bundled mock vendor data. Authenticated mutations do not silently replace backend persistence.

## ðŸš€ Getting Started & Local Setup

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally, or a reachable MongoDB deployment
- The companion frontend repository for the complete user-facing application

### 1. Clone the repositories

```bash
git clone https://github.com/Karan9389/Event_Ease_Backend.git
git clone https://github.com/Karan9389/Event_Ease.git
```

### 2. Install backend dependencies

```bash
cd Event_Ease_Backend
npm install
```

### 3. Configure the backend

Create `.env` in the backend root:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_ease
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

Start MongoDB, then start the API:

```bash
npm start
```

The backend is available at `http://localhost:5000`; a successful `GET /` returns `{ "message": "Event Ease backend is running" }`. On first startup, the service seed runs when no services exist.

### 4. Start the frontend

In a second terminal:

```bash
cd Event_Ease
npm install
npm run dev
```

The Vite client runs at `http://localhost:3000` and uses the local backend API at `http://localhost:5000/api`.

### Available scripts

Backend:

| Command | Purpose |
|---|---|
| `npm start` | Starts the Express server with `node src/server.js`. |
| `npm test` | Placeholder script; no automated backend tests are currently configured. |

Frontend:

| Command | Purpose |
|---|---|
| `npm run dev` | Starts Vite on port `3000`. |
| `npm run build` | Creates the production bundle in `dist/`. |
| `npm run preview` | Serves the built Vite bundle locally. |
| `npm run lint` | Runs the TypeScript compiler in no-emit mode. |

## ðŸ‘¨â€ðŸ’» Maintainer

**Karan Kumar** Â· [GitHub](https://github.com/Karan9389)


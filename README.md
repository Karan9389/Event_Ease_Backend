# EventEasy Backend

REST API for discovering event vendors, managing user selections, and creating event bookings.

## System Architecture

EventEasy is a decoupled client-server application:

```text
Browser
  |
  | REST API requests over JSON
  v
EventEasy Frontend (React, TypeScript, Vite)
  |
  | http://localhost:5000/api
  v
EventEasy Backend (Node.js, Express)
  |
  | Mongoose
  v
MongoDB
```

### Companion repositories

- Frontend: [EventEasy Frontend](https://github.com/Karan9389/Event_Ease)
- Backend: [EventEasy Backend](https://github.com/Karan9389/Event_Ease_Backend) (this repository)

The frontend communicates with this backend through JSON REST endpoints. Public service discovery endpoints do not require authentication. User-specific endpoints require a JWT in the `Authorization` header. The frontend stores the token in browser local storage using the key `event_ease_token`.

The backend allows cross-origin requests during development. In production, set `ALLOWED_ORIGINS` to a comma-separated list of trusted frontend origins.

## API Endpoints

| Area | Endpoint | Methods | Access |
|---|---|---|---|
| Health | `/` | GET | Public |
| Authentication | `/api/auth/register` | POST | Public |
| Authentication | `/api/auth/login` | POST | Public |
| Authentication | `/api/auth/me` | GET | JWT required |
| Services | `/api/services` | GET | Public |
| Services | `/api/services/:id` | GET | Public |
| Services | `/api/services` | POST | JWT required |
| Cart | `/api/cart` | GET, POST | JWT required |
| Cart | `/api/cart/clear` | DELETE | JWT required |
| Cart | `/api/cart/:serviceId` | DELETE | JWT required |
| Wishlist | `/api/wishlist` | GET | JWT required |
| Wishlist | `/api/wishlist/toggle` | POST | JWT required |
| Wishlist | `/api/wishlist/:serviceId` | DELETE | JWT required |
| Orders | `/api/orders` | GET, POST | JWT required |

## Technology Stack

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- Joi
- CORS
- Helmet
- express-rate-limit
- dotenv

## Environment Variables

Create a `.env` file in the backend root. Do not commit real secrets.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | HTTP port. Defaults to `5000`. |
| `MONGO_URI` | No | MongoDB connection string. Defaults to `mongodb://127.0.0.1:27017/event_ease`. |
| `JWT_SECRET` | Yes in production | Secret used to sign and verify authentication tokens. |
| `NODE_ENV` | No | Use `production` to enable production CORS rules and strict JWT secret enforcement. |
| `ALLOWED_ORIGINS` | Production | Comma-separated list of allowed frontend origins. |

Example development configuration:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_ease
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

The frontend currently uses `http://localhost:5000/api` directly in `src/lib/api.ts`. Its `.env.example` does not define any variables.

## Database Schema

The application uses MongoDB collections managed through Mongoose.

### Users

Model: `User`

- `_id`: MongoDB ObjectId
- `name`: required string
- `email`: required, unique, lowercased string
- `password`: required bcrypt hash
- `cart`: array of references to `Service`
- `wishlist`: array of references to `Service`
- `createdAt`
- `updatedAt`

### Services

Model: `Service`

- `_id`: MongoDB ObjectId
- `name`: required string
- `category`: `photography`, `catering`, `music`, or `makeup`
- `description`: required string
- `price`: required non-negative number
- `originalPrice`: optional number
- `priceUnit`: optional text such as `/pp` or `/ event`
- `rating`: number from 0 to 5
- `reviewCount`: non-negative number
- `image`: image URL
- `tags`: array of strings
- `location`: location text
- `availability`: availability text
- `featured`: Boolean
- `createdAt`
- `updatedAt`

### Orders

Model: `Order`

- `_id`: MongoDB ObjectId
- `user`: reference to `User`
- `items`: embedded order item snapshots
- `items.service`: reference to `Service`
- `items.name`: service name at checkout
- `items.category`: service category at checkout
- `items.price`: service price at checkout
- `items.image`: service image at checkout
- `subtotal`: sum of item prices
- `tax`: 8 percent of the subtotal, rounded
- `total`: subtotal plus tax
- `eventName`: booking name
- `eventDate`: booking date
- `status`: `Planning`, `Confirmed`, `Completed`, or `Cancelled`
- `createdAt`
- `updatedAt`

### Data relationships

1. A user can reference many services in their cart.
2. A user can reference many services in their wishlist.
3. An order belongs to one user.
4. An order stores service details as embedded snapshots so the booking remains readable if a service changes later.
5. Creating an order clears the user's cart.

When the server starts, the seed script inserts default vendors only if the services collection is empty.

## Project Structure

```text
Event_Ease_Backend/
|-- package.json
|-- .env
`-- src/
    |-- server.js
    |-- config/
    |   `-- seed.js
    |-- controllers/
    |   |-- authControllers.js
    |   |-- cartControllers.js
    |   |-- orderControllers.js
    |   |-- serviceControllers.js
    |   `-- wishlistControllers.js
    |-- lib/
    |   |-- errorResponse.js
    |   `-- validators.js
    |-- middleware/
    |   `-- authMiddleware.js
    |-- models/
    |   |-- Order.js
    |   |-- Service.js
    |   `-- User.js
    `-- routes/db/
        |-- authRoute.js
        |-- cartRoute.js
        |-- orderRoute.js
        |-- serviceRoute.js
        `-- wishlistRoute.js
```

## Request Flow

1. A frontend page calls a function in `src/lib/api.ts`.
2. The browser sends a JSON request to the matching backend route.
3. Express applies CORS, JSON parsing, Helmet, and rate limiting.
4. Protected routes run JWT authentication middleware.
5. Joi validates supported request bodies.
6. Controllers read or update MongoDB through Mongoose models.
7. The controller returns a JSON response.
8. The frontend updates its React context and page state.

The frontend can use bundled mock vendors if the public service request cannot reach the backend. Authenticated operations still require the backend for persistence.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a reachable MongoDB instance

### Clone the repositories

```bash
git clone https://github.com/Karan9389/Event_Ease_Backend.git
git clone https://github.com/Karan9389/Event_Ease.git
```

### Install and run the backend

```bash
cd Event_Ease_Backend
npm install
npm start
```

The backend starts at `http://localhost:5000`.

### Install and run the frontend

Open a second terminal:

```bash
cd Event_Ease
npm install
npm run dev
```

The frontend starts at `http://localhost:3000`.

### Backend scripts

| Command | Description |
|---|---|
| `npm start` | Starts `src/server.js`. |
| `npm test` | Placeholder script; automated backend tests are not currently configured. |

### Frontend scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on port 3000. |
| `npm run build` | Creates the production bundle. |
| `npm run preview` | Serves the production bundle locally. |
| `npm run lint` | Runs TypeScript validation without emitting files. |

For the client-side application and UI details, see the [frontend README](https://github.com/Karan9389/Event_Ease#readme).

## Maintainer

Karan Kumar - [GitHub](https://github.com/Karan9389)

# EventEase Backend

Express 5 REST API for vendor discovery, user accounts, saved carts and wishlists, and event bookings. MongoDB data is managed with Mongoose.

## Requirements and setup

- Node.js 20 or newer
- npm
- MongoDB

```bash
npm install
npm start
```

The server connects to MongoDB and seeds the default vendors before it begins listening. Defaults are `http://localhost:5000` and `mongodb://127.0.0.1:27017/event_ease`.

Create a `.env` file in this directory to configure the server:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_ease
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

In production, `JWT_SECRET` and `ALLOWED_ORIGINS` are required. Set `ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins, for example:

```dotenv
NODE_ENV=production
JWT_SECRET=use-a-long-random-secret-from-a-secret-manager
ALLOWED_ORIGINS=https://events.example.com
```

Do not commit real secrets.

## API

All endpoints exchange JSON. Protected endpoints require a JWT sent in an HTTP authentication header using the standard bearer-token scheme. Tokens are issued at registration and login and expire after seven days.

| Endpoint | Methods | Access | Description |
|---|---|---|---|
| `/` | GET | Public | Health response |
| `/api/auth/register` | POST | Public | Create an account |
| `/api/auth/login` | POST | Public | Authenticate |
| `/api/auth/me` | GET | JWT | Return the current user, cart, and wishlist |
| `/api/services` | GET | Public | List/search services using optional `category`, `q`, and `location` query parameters |
| `/api/services/:id` | GET | Public | Get one service |
| `/api/services` | POST | JWT | Create a service |
| `/api/cart` | GET, POST | JWT | Read the cart or add a service (`serviceId`) |
| `/api/cart/clear` | DELETE | JWT | Clear the cart |
| `/api/cart/:serviceId` | DELETE | JWT | Remove a service |
| `/api/wishlist` | GET | JWT | Read the wishlist |
| `/api/wishlist/toggle` | POST | JWT | Toggle a service (`serviceId`) |
| `/api/wishlist/:serviceId` | DELETE | JWT | Remove a service |
| `/api/orders` | GET | JWT | List the current user's bookings |
| `/api/orders` | POST | JWT | Book the current cart |

### Booking request

Send optional event details; order items, names, and prices are loaded from the authenticated user's server-side cart:

```json
{
  "eventName": "Wedding Reception",
  "eventDate": "2027-06-15"
}
```

`eventDate` must be a valid `YYYY-MM-DD` date and cannot be in the past. If omitted, the API assigns a default event name and a date 14 days ahead. The API calculates an 8% tax (rounded to the nearest whole unit), saves an item snapshot in the order, then clears the cart.

## Data and startup

The `User` model stores account details and service references for cart and wishlist. `Service` stores category, description, pricing, availability, and display details. `Order` records the event details, status, calculated totals, and service snapshots. Default services are inserted only when the services collection is empty.

Run the backend's built-in request-validation tests with `npm test`.

For workspace setup and frontend instructions, see the [root README](../README.md) and [frontend README](../Event_Ease_Frontend/README.md).

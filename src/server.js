const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const seedDatabase = require("./config/seed");

const authRoutes = require("./routes/db/authRoute");
const serviceRoutes = require("./routes/db/serviceRoute");
const cartRoutes = require("./routes/db/cartRoute");
const wishlistRoutes = require("./routes/db/wishlistRoute");
const orderRoutes = require("./routes/db/orderRoute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Warn when JWT_SECRET is not configured. In production, set this to a strong secret.
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Using a development fallback is insecure in production.");
}

// Security middleware
app.use(helmet());

// Rate limiter: conservative defaults
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Restrict CORS origins in production via ALLOWED_ORIGINS env var (comma-separated)
if (process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGINS) {
  const allowed = process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  app.use(cors({ origin: (origin, callback) => {
    if (!origin || allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }}));
}

app.get("/", (req, res) => {
  res.json({ message: "Event Ease backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_ease")
  .then(() => {
    console.log("MongoDB connected");
    seedDatabase();
  })
  .catch((error) => console.error("MongoDB connection error:", error.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Centralized error handler to avoid leaking internal details
const errorResponse = require("./lib/errorResponse");
app.use((err, req, res, next) => {
  if (!err) return next();
  console.error(err);
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'CORS not allowed' });
  }
  return errorResponse(res, 'Internal server error', err, 500);
});

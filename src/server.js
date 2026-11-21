require("dotenv").config();
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

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set in production.");
}

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. A development fallback will be used.");
}

if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS must be set in production.");
}

if (process.env.NODE_ENV === "production") {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (allowedOrigins.length === 0) {
    throw new Error("ALLOWED_ORIGINS must include at least one frontend origin.");
  }
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
  }));
} else {
  app.use(cors());
}

app.use(express.json());

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

app.get("/", (req, res) => {
  res.json({ message: "Event Ease backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_ease");
    console.log("MongoDB connected");
    await seedDatabase();
    return await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        resolve(server);
      });
      server.once("error", reject);
    });
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };

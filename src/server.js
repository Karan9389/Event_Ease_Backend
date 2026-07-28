const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

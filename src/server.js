const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/db/authRoute");
const serviceRoutes = require("./routes/db/serviceRoute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Event Ease backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_ease")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    eventName: { type: String, default: "Event Booking" },
    eventDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    status: {
      type: String,
      enum: ["Planning", "Confirmed", "Completed", "Cancelled"],
      default: "Planning",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

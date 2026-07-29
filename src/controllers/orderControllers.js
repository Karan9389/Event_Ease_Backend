const Order = require("../models/Order");
const User = require("../models/User");
const Service = require("../models/Service");
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const { items, eventName, eventDate } = req.body;

    let orderItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItems = items.map((item) => {
        const rawId = item.id || item._id;
        const serviceId = mongoose.Types.ObjectId.isValid(rawId)
          ? rawId
          : new mongoose.Types.ObjectId();
        return {
          service: serviceId,
          name: item.name,
          category: item.category,
          price: item.price,
          image: item.image || "",
        };
      });
    } else {
      // If items not sent, fetch from user's current cart
      const user = await User.findById(req.user._id).populate("cart");
      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      orderItems = user.cart.map((item) => ({
        service: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image || "",
      }));
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      eventName: eventName || "Summer Celebration",
      eventDate: eventDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Planning",
    });

    // Clear user's cart after checkout
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

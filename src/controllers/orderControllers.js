const Order = require("../models/Order");
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  try {
    const { eventName, eventDate } = req.body;
    const user = await User.findById(req.user._id).populate("cart");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validCart = (user.cart || []).filter((item) => item && item._id);
    if (validCart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = validCart.map((item) => ({
      service: item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image || "",
    }));
    const subtotal = Math.round(orderItems.reduce((sum, i) => sum + i.price, 0) * 100) / 100;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      eventName: eventName || "Event Booking",
      eventDate: eventDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "Planning",
    });

    // Clear user's cart after checkout
    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Failed to place order", error, 500);
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Failed to fetch orders", error, 500);
  }
};

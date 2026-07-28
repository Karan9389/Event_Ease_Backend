const User = require("../models/User");
const Service = require("../models/Service");

const formatService = (s) => ({
  id: s._id.toString(),
  _id: s._id,
  name: s.name,
  category: s.category,
  description: s.description,
  price: s.price,
  originalPrice: s.originalPrice,
  priceUnit: s.priceUnit,
  rating: s.rating,
  reviewCount: s.reviewCount,
  image: s.image,
  tags: s.tags,
});

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const cart = (user.cart || []).map(formatService);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ message: "serviceId is required" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user.cart.includes(service._id)) {
      user.cart.push(service._id);
      await user.save();
    }

    const updatedUser = await User.findById(req.user._id).populate("cart");
    const cart = (updatedUser.cart || []).map(formatService);
    res.status(200).json({ message: "Added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter((id) => id.toString() !== serviceId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("cart");
    const cart = (updatedUser.cart || []).map(formatService);
    res.status(200).json({ message: "Removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from cart", error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.status(200).json({ message: "Cart cleared", cart: [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};

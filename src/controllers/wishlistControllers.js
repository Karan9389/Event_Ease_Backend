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

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const wishlist = (user.wishlist || []).map(formatService);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
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
    const existsIndex = user.wishlist.findIndex((id) => id.toString() === serviceId);

    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
    } else {
      user.wishlist.push(service._id);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    const wishlist = (updatedUser.wishlist || []).map(formatService);
    res.status(200).json({ message: "Wishlist updated", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist", error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== serviceId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    const wishlist = (updatedUser.wishlist || []).map(formatService);
    res.status(200).json({ message: "Removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from wishlist", error: error.message });
  }
};

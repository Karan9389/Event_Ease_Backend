const User = require("../models/User");
const Service = require("../models/Service");
const mongoose = require("mongoose");

const formatService = (s) => {
  if (!s || !s._id) return null;
  return {
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
  };
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const wishlist = (user.wishlist || []).map(formatService).filter(Boolean);
    res.status(200).json(wishlist);
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Failed to fetch wishlist", error, 500);
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ message: "serviceId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const existsIndex = user.wishlist.findIndex((id) => id && id.toString() === serviceId);

    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
    } else {
      user.wishlist.push(service._id);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    const wishlist = (updatedUser.wishlist || []).map(formatService).filter(Boolean);
    res.status(200).json({ message: "Wishlist updated", wishlist });
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Failed to update wishlist", error, 500);
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { serviceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((id) => id && id.toString() !== serviceId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");
    const wishlist = (updatedUser.wishlist || []).map(formatService).filter(Boolean);
    res.status(200).json({ message: "Removed from wishlist", wishlist });
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Failed to remove from wishlist", error, 500);
  }
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "eventease_dev_secret";

const formatService = (s) =>
  s && s._id
    ? {
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
      }
    : s;

const createToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = createToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, cart: [], wishlist: [] },
    });
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Registration failed", error, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("cart").populate("wishlist");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cart: (user.cart || []).map(formatService).filter(Boolean),
        wishlist: (user.wishlist || []).map(formatService).filter(Boolean),
      },
    });
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Login failed", error, 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart").populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cart: (user.cart || []).map(formatService).filter(Boolean),
        wishlist: (user.wishlist || []).map(formatService).filter(Boolean),
      },
    });
  } catch (error) {
    const errorResponse = require("../lib/errorResponse");
    return errorResponse(res, "Error fetching user", error, 500);
  }
};

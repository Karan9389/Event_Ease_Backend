const Service = require("../models/Service");

// Escape regex metacharacters to avoid ReDoS and unintended patterns
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.getServices = async (req, res) => {
  try {
    const { category, q, location } = req.query;

    const filter = {};
    if (category) {
      filter.category = String(category).toLowerCase();
    }
    if (location) {
      filter.location = { $regex: escapeRegex(location), $options: "i" };
    }
    if (q) {
      filter.$or = [
        { name: { $regex: escapeRegex(q), $options: "i" } },
        { description: { $regex: escapeRegex(q), $options: "i" } },
        { tags: { $regex: escapeRegex(q), $options: "i" } },
        { location: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    const services = await Service.find(filter).sort({ featured: -1, createdAt: -1 });

    // Transform _id to id for frontend compatibility
    const formattedServices = services.map((s) => ({
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
      location: s.location,
      availability: s.availability,
      featured: s.featured,
    }));

    res.status(200).json(formattedServices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services", error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({
      id: service._id.toString(),
      _id: service._id,
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      originalPrice: service.originalPrice,
      priceUnit: service.priceUnit,
      rating: service.rating,
      reviewCount: service.reviewCount,
      image: service.image,
      tags: service.tags,
      location: service.location,
      availability: service.availability,
      featured: service.featured,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch service", error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      originalPrice,
      priceUnit,
      rating,
      reviewCount,
      image,
      tags,
      location,
      availability,
      featured,
    } = req.body;

    // Basic validation and sanitization
    if (!name || !category || !description || price === undefined) {
      return res.status(400).json({ message: "Name, category, description, and price are required" });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Invalid name" });
    }

    const allowedCategories = ["photography", "catering", "music", "makeup"];
    if (!allowedCategories.includes(String(category).toLowerCase())) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (typeof description !== "string" || description.trim().length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters" });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const safeTags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];

    const service = await Service.create({
      name,
      category: String(category).toLowerCase(),
      description,
      price: numericPrice,
      originalPrice,
      priceUnit,
      rating,
      reviewCount,
      image,
      tags: safeTags,
      location,
      availability,
      featured,
    });

    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    res.status(500).json({ message: "Failed to create service", error: error.message });
  }
};

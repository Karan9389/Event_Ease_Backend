const Service = require("../models/Service");

exports.getServices = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category ? { category: String(category).toLowerCase() } : {};

    const services = await Service.find(filter).sort({ featured: -1, createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services", error: error.message });
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

    if (!name || !category || !description || price === undefined) {
      return res.status(400).json({ message: "Name, category, description, and price are required" });
    }

    const service = await Service.create({
      name,
      category: String(category).toLowerCase(),
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
    });

    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    res.status(500).json({ message: "Failed to create service", error: error.message });
  }
};

const Service = require("../models/Service");

exports.getServices = async (req, res) => {
  try {
    const { category, q } = req.query;

    const filter = {};
    if (category) {
      filter.category = String(category).toLowerCase();
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
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

const Joi = require('joi');

// Auth validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Service validation schemas
const createServiceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Service name is required',
    'string.min': 'Service name must be at least 2 characters',
    'any.required': 'Service name is required',
  }),
  category: Joi.string().lowercase().valid("photography", "catering", "music", "makeup").required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must not exceed 1000 characters',
    'any.required': 'Description is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be zero or more',
    'any.required': 'Price is required',
  }),
  originalPrice: Joi.number().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviewCount: Joi.number().integer().min(0).optional(),
  priceUnit: Joi.string().allow('', null).optional(),
  location: Joi.string().max(100).allow('', null).optional(),
  image: Joi.string().max(2000).allow('', null).optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  availability: Joi.string().max(100).optional(),
  featured: Joi.boolean().optional(),
});

const createOrderSchema = Joi.object({
  eventName: Joi.string().trim().min(2).max(100).optional(),
  eventDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        return helpers.error('date.format');
      }
      if (value < new Date().toISOString().slice(0, 10)) {
        return helpers.error('date.min');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Event date must use YYYY-MM-DD format',
      'date.format': 'Event date must be a valid calendar date',
      'date.min': 'Event date cannot be in the past',
    })
    .optional(),
});

const updateServiceSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  category: Joi.string().lowercase().valid("photography", "catering", "music", "makeup"),
  description: Joi.string().min(10).max(1000),
  price: Joi.number().min(0),
  originalPrice: Joi.number().min(0),
  rating: Joi.number().min(0).max(5),
  reviewCount: Joi.number().integer().min(0),
  priceUnit: Joi.string().allow('', null).optional(),
  location: Joi.string().max(100).allow('', null).optional(),
  image: Joi.string().max(2000).allow('', null).optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  availability: Joi.string().max(100),
  featured: Joi.boolean(),
});

// Validation middleware factory
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  createServiceSchema,
  updateServiceSchema,
  createOrderSchema,
  validateRequest,
};

const Joi = require('joi');

// Auth validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
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
  category: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description must not exceed 1000 characters',
    'any.required': 'Description is required',
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required',
  }),
  priceUnit: Joi.string().valid('per_event', 'per_hour', 'per_person').required().messages({
    'any.only': 'Price unit must be per_event, per_hour, or per_person',
    'any.required': 'Price unit is required',
  }),
  location: Joi.string().max(100).allow(''),
  image: Joi.string().uri().allow(''),
  tags: Joi.array().items(Joi.string()).allow([]),
});

const updateServiceSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  category: Joi.string().min(2).max(50),
  description: Joi.string().min(10).max(1000),
  price: Joi.number().positive(),
  priceUnit: Joi.string().valid('per_event', 'per_hour', 'per_person'),
  location: Joi.string().max(100).allow(''),
  image: Joi.string().uri().allow(''),
  tags: Joi.array().items(Joi.string()).allow([]),
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
  validateRequest,
};

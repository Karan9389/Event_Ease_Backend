const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { createOrder, getUserOrders } = require("../../controllers/orderControllers");
const { validateRequest, createOrderSchema } = require("../../lib/validators");

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateRequest(createOrderSchema), createOrder);
router.get("/", getUserOrders);

module.exports = router;

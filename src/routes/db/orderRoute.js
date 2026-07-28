const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { createOrder, getUserOrders } = require("../../controllers/orderControllers");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getUserOrders);

module.exports = router;

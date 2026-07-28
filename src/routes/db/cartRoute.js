const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../../controllers/cartControllers");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/clear", clearCart);
router.delete("/:serviceId", removeFromCart);

module.exports = router;

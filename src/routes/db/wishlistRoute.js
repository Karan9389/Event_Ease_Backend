const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} = require("../../controllers/wishlistControllers");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/:serviceId", removeFromWishlist);

module.exports = router;

const express = require("express");
const { getServices, getServiceById, createService } = require("../../controllers/serviceControllers");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);
// Protect creating services behind authentication (add authorization later)
router.post("/", authMiddleware, createService);

module.exports = router;

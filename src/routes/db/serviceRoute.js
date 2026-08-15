const express = require("express");
const { getServices, getServiceById, createService } = require("../../controllers/serviceControllers");
const authMiddleware = require("../../middleware/authMiddleware");
const { validateRequest, createServiceSchema } = require("../../lib/validators");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);
// Protect creating services behind authentication with validation
router.post("/", authMiddleware, validateRequest(createServiceSchema), createService);

module.exports = router;

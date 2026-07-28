const express = require("express");
const { getServices, getServiceById, createService } = require("../../controllers/serviceControllers");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/", createService);

module.exports = router;

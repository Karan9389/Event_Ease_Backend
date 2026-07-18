const express = require("express");
const { getServices, createService } = require("../../controllers/serviceControllers");

const router = express.Router();

router.get("/", getServices);
router.post("/", createService);

module.exports = router;

const express = require("express");
const { register, login, getMe } = require("../../controllers/authControllers");
const authMiddleware = require("../../middleware/authMiddleware");
const { validateRequest, registerSchema, loginSchema } = require("../../lib/validators");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authMiddleware, getMe);

module.exports = router;

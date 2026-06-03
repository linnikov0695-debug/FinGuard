import express from "express";

import { register, login } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { requiredAuth } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);

router.post("/login", authLimiter, validate(loginSchema), login);

router.get("/me", requiredAuth, (req, res) => {
  res.json({
    user: req.user,
  });
});

export default router;

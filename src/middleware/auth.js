import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requiredAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Authorization header is missing",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "unauthorized",
        message: "Invalid authorization format",
      });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);

    req.user = payload;

    return next();
  } catch (err) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Invalid or expired token",
    });
  }
}

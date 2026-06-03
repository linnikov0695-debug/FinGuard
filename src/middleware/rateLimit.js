import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error("🔥 ERROR:", err);

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const message =
    isProduction && status === 500
      ? "Unexpected server error."
      : err.message || "Unexpected server error.";

  return res.status(status).json({
    error: err.name || "Error",
    message,
  });
}

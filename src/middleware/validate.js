function formatValidationError(issue) {
  const field = issue.path.join(".");

  if (issue.code === "invalid_type") {
    return `${field} is required`;
  }

  if (issue.code === "too_small") {
    return `${field} must be at least ${issue.minimum} characters long`;
  }

  if (issue.code === "too_big") {
    return `${field} is too long or too large`;
  }

  if (issue.code === "invalid_value") {
    if (issue.values) {
      return `${field} must be one of: ${issue.values.join(", ")}`;
    }

    return `${field} has invalid value`;
  }

  return issue.message;
}

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next({
        status: 400,
        name: "ValidationError",
        message: result.error.issues.map(formatValidationError).join(", "),
      });
    }

    req.validated = result.data;
    next();
  };
};

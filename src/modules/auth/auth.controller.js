import { loginUser, registerUser } from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.validated);

    return res.status(201).json({
      user,
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.validated);

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

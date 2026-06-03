import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";
import { env } from "../../config/env.js";

export async function registerUser(data) {
  const { email, password } = data;

  const existingResult = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingResult.rows.length > 0) {
    throw {
      status: 400,
      name: "UserAlreadyExists",
      message: "A user with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
       VALUES ($1, $2) 
       RETURNING id`,
    [email, passwordHash]
  );

  return result.rows[0];
}

export async function loginUser(data) {
  const { email, password } = data;

  const result = await pool.query(
    "SELECT id,email, password_hash FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw {
      status: 401,
      name: "InvalidCredentials",
      message: "Invalid email or password.",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw {
      status: 401,
      name: "InvalidCredentials",
      message: "Invalid email or password.",
    };
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

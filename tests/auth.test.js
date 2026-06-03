import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Auth API", () => {
  it("should register a new user (happy path)", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: `test${Date.now()}@example.com`,
        password: "123456",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
  });

  it("should fail if email is missing", async () => {
    const response = await request(app).post("/auth/register").send({
      password: "123456",
    });

    expect(response.status).toBe(400);
  });

  it("should fail if password is missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: `test${Date.now()}@example.com`,
      });

    expect(response.status).toBe(400);
  });

  it("should fail if email is already registered", async () => {
    const email = `test${Date.now()}@example.com`;

    // First registration should succeed
    await request(app).post("/auth/register").send({
      email,
      password: "123456",
    });

    // Second registration with same email should fail
    const response = await request(app).post("/auth/register").send({
      email,
      password: "123456",
    });

    expect(response.status).toBe(400);
  });
});

describe("Login API", () => {
  it("should login successfully an existing user", async () => {
    const email = `test${Date.now()}@example.com`;
    const password = "123456";

    // Register the user first
    await request(app).post("/auth/register").send({
      email,
      password,
    });

    // Attempt to login
    const response = await request(app).post("/auth/login").send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user.email).toBe(email);
  });

  it("should fail login with wrong password", async () => {
    const email = `test${Date.now()}@example.com`;
    const password = "123456";

    // Register the user first
    await request(app).post("/auth/register").send({
      email,
      password,
    });

    // Attempt to login with wrong password
    const response = await request(app).post("/auth/login").send({
      email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
  });

  it("should fail login with nonexisting email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: `nonexisting${Date.now()}@example.com`,
        password: "123456",
      });

    expect(response.status).toBe(401);
  });
});

describe("Protected route /auth/me", () => {
  it("should fail access to /auth/me without token", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
  });

  it("should allow access to /auth/me with valid token", async () => {
    const email = `test${Date.now()}@example.com`;
    const password = "123456";

    // Register the user first
    await request(app).post("/auth/register").send({
      email,
      password,
    });

    // Login to get token
    const loginResponse = await request(app).post("/auth/login").send({
      email,
      password,
    });

    const token = loginResponse.body.token;

    // Access /auth/me with token
    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("userId");
  });
});

afterAll(async () => {
  await pool.end();
});

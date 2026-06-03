import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Transactions API", () => {
  it("should fail to create a new transaction without token", async () => {
    const response = await request(app).post("/transactions").send({
      amount: 100,
      currency: "USD",
      type: "deposit",
    });

    expect(response.status).toBe(401);
  });

  it("should create a new transaction with valid token", async () => {
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

    // Create a new transaction with token

    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        currency: "USD",
        type: "deposit",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("transaction");
    expect(response.body.transaction).toHaveProperty("id");
    expect(response.body.transaction).toHaveProperty("userId");
    expect(response.body.transaction).toHaveProperty("amount");
    expect(response.body.transaction).toHaveProperty("currency");
    expect(response.body.transaction).toHaveProperty("type");
  });

  it("should fail if transaction amount is negative", async () => {
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

    // Attempt to create a transaction with negative amount

    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: -50,
        currency: "USD",
        type: "deposit",
      });

    expect(response.status).toBe(400);
  });

  it("should fail if transaction type is invalid", async () => {
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

    // Attempt to create a transaction with invalid type

    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        currency: "USD",
        type: "invalidtype",
      });

    expect(response.status).toBe(400);
  });

  it("should fail if transaction currency is missing", async () => {
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

    // Attempt to create a transaction with missing currency
    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        type: "deposit",
      });

    expect(response.status).toBe(400);
  });
});

afterAll(async () => {
  await pool.end();
});

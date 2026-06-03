import request from "supertest";

import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Risk Integration", () => {
  let token;

  beforeAll(async () => {
    const email = `risk_${Date.now()}@example.com`;
    const password = "123456";

    await request(app).post("/auth/register").send({
      email,
      password,
    });

    const loginRes = await request(app).post("/auth/login").send({
      email,
      password,
    });

    token = loginRes.body.token;
  });

  it("should create an alert when transaction is high risk", async () => {
    const transactionRes = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10000,
        currency: "USD",
        type: "deposit",
      });

    expect(transactionRes.statusCode).toBe(201);

    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${token}`);

    expect(alertsRes.statusCode).toBe(200);
    expect(alertsRes.body).toHaveProperty("alerts");
    expect(Array.isArray(alertsRes.body.alerts)).toBe(true);

    const highAmountAlert = alertsRes.body.alerts.find(
      (alert) => alert.type === "HIGH_AMOUNT"
    );

    expect(highAmountAlert).toBeDefined();
    expect(highAmountAlert.riskLevel).toBe("high");
  });

  it("should create a BLACKLIST_MATCH alert when transaction entity is blacklisted", async () => {
    const entityValue = `blacklisted_${Date.now()}@example.com`;

    const blacklistRes = await request(app)
      .post("/blacklist")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "email",
        entityValue,
        reason: "Synthetic blacklisted email for risk test",
      });

    expect(blacklistRes.statusCode).toBe(201);

    const transactionRes = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        currency: "USD",
        type: "deposit",
        entityType: "email",
        entityValue,
      });

    expect(transactionRes.statusCode).toBe(201);

    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${token}`);

    expect(alertsRes.statusCode).toBe(200);
    expect(Array.isArray(alertsRes.body.alerts)).toBe(true);

    const blacklistAlert = alertsRes.body.alerts.find(
      (alert) => alert.type === "BLACKLIST_MATCH"
    );

    expect(blacklistAlert).toBeDefined();
    expect(blacklistAlert.riskLevel).toBe("critical");
  });

  it("should create a RAPID_TRANSACTIONS alert after multiple transactions in a short time window", async () => {
    const email = `rapid_${Date.now()}@example.com`;
    const password = "123456";

    await request(app).post("/auth/register").send({
      email,
      password,
    });

    const loginRes = await request(app).post("/auth/login").send({
      email,
      password,
    });

    const localToken = loginRes.body.token;

    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post("/transactions")
        .set("Authorization", `Bearer ${localToken}`)
        .send({
          amount: 100,
          currency: "USD",
          type: "deposit",
        });

      expect(res.statusCode).toBe(201);
    }

    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${localToken}`);

    expect(alertsRes.statusCode).toBe(200);
    expect(Array.isArray(alertsRes.body.alerts)).toBe(true);

    const rapidAlert = alertsRes.body.alerts.find(
      (alert) => alert.type === "RAPID_TRANSACTIONS"
    );

    expect(rapidAlert).toBeDefined();
    expect(rapidAlert.riskLevel).toBe("medium");
  });

  it("should create a MULTIPLE_HIGH_RISK_ALERTS alert when user already has multiple open high-risk alerts", async () => {
    const email = `multiple_high_risk_${Date.now()}@example.com`;
    const password = "123456";

    await request(app).post("/auth/register").send({
      email,
      password,
    });

    const loginRes = await request(app).post("/auth/login").send({
      email,
      password,
    });

    const localToken = loginRes.body.token;

    const userResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    const userId = userResult.rows[0].id;

    const transactionOne = await pool.query(
      `INSERT INTO transactions (user_id, amount, currency, type)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
      [userId, 10000, "USD", "deposit"]
    );

    const transactionTwo = await pool.query(
      `INSERT INTO transactions (user_id, amount, currency, type)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
      [userId, 50000, "USD", "deposit"]
    );

    await pool.query(
      `INSERT INTO alerts (user_id, transaction_id, type, risk_level, message, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        transactionOne.rows[0].id,
        "TEST_HIGH_RISK_ALERT_ONE",
        "high",
        "Synthetic existing high-risk alert for test",
        "open",
      ]
    );

    await pool.query(
      `INSERT INTO alerts (user_id, transaction_id, type, risk_level, message, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        transactionTwo.rows[0].id,
        "TEST_HIGH_RISK_ALERT_TWO",
        "critical",
        "Synthetic existing critical-risk alert for test",
        "open",
      ]
    );

    const triggerRes = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${localToken}`)
      .send({
        amount: 100,
        currency: "USD",
        type: "deposit",
      });

    expect(triggerRes.statusCode).toBe(201);

    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${localToken}`);

    expect(alertsRes.statusCode).toBe(200);

    const multipleHighRiskAlert = alertsRes.body.alerts.find(
      (alert) => alert.type === "MULTIPLE_HIGH_RISK_ALERTS"
    );

    expect(multipleHighRiskAlert).toBeDefined();
    expect(multipleHighRiskAlert.riskLevel).toBe("high");
  });
});

afterAll(async () => {
  await pool.end();
});

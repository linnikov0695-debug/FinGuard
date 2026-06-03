import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Alerts API", () => {
  let token;

  beforeAll(async () => {
    const email = `alerts_${Date.now()}@example.com`;
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

    await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10000,
        currency: "USD",
        type: "deposit",
      });
  });

  it("should return alerts for user", async () => {
    const res = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("alerts");
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  it("should filter alerts by risk level", async () => {
    const res = await request(app)
      .get("/alerts?riskLevel=High")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("alerts");
  });

  it("should limit alerts", async () => {
    const res = await request(app)
      .get("/alerts?limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.alerts.length).toBeLessThanOrEqual(1);
  });

  it("should update alert status", async () => {
    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${token}`);

    const alertId = alertsRes.body.alerts[0].id;

    const updateRes = await request(app)
      .patch(`/alerts/${alertId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "reviewed",
      });

    expect(updateRes.statusCode).toBe(200);

    expect(updateRes.body).toHaveProperty("alert");

    expect(updateRes.body.alert.status).toBe("reviewed");
  });

  it("should filter alerts by status", async () => {
    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${token}`);

    const alertId = alertsRes.body.alerts[0].id;

    await request(app)
      .patch(`/alerts/${alertId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "reviewed",
      });

    const reviewedRes = await request(app)
      .get("/alerts?status=reviewed")
      .set("Authorization", `Bearer ${token}`);

    expect(reviewedRes.statusCode).toBe(200);
    expect(reviewedRes.body).toHaveProperty("alerts");
    expect(Array.isArray(reviewedRes.body.alerts)).toBe(true);

    for (const alert of reviewedRes.body.alerts) {
      expect(alert.status).toBe("reviewed");
    }
  });
});

afterAll(async () => {
  await pool.end();
});

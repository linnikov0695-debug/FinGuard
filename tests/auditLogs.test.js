import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Audit Logs API", () => {
  let token;
  let alertId;

  beforeAll(async () => {
    const email = `audit_${Date.now()}@example.com`;
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

    const alertsRes = await request(app)
      .get("/alerts")
      .set("Authorization", `Bearer ${token}`);

    alertId = alertsRes.body.alerts[0].id;
  });

  it("should create audit log when alert status changes", async () => {
    await request(app)
      .patch(`/alerts/${alertId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "reviewed",
      });

    const logsRes = await request(app)
      .get("/audit-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(logsRes.statusCode).toBe(200);
    expect(logsRes.body).toHaveProperty("logs");
    expect(Array.isArray(logsRes.body.logs)).toBe(true);

    const alertLog = logsRes.body.logs.find(
      (log) =>
        log.entityType === "alert" &&
        log.entityId === alertId &&
        log.action === "status_changed"
    );

    expect(alertLog).toBeDefined();
    expect(alertLog.oldValue).toBe("open");
    expect(alertLog.newValue).toBe("reviewed");
  });
});

afterAll(async () => {
  await pool.end();
});

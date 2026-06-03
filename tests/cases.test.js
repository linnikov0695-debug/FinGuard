import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

describe("Cases API", () => {
  let token;
  let alertId;
  let caseId;

  beforeAll(async () => {
    const email = `cases_${Date.now()}@example.com`;

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

  it("should create a case", async () => {
    const res = await request(app)
      .post("/cases")
      .set("Authorization", `Bearer ${token}`)
      .send({
        alertId,
        title: "High amount transaction review",
        description:
          "Created case for investigating high value transaction alert.",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("case");
    expect(res.body.case.alertId).toBe(alertId);
    expect(res.body.case.status).toBe("open");

    caseId = res.body.case.id;
  });

  it("should return cases for user", async () => {
    const res = await request(app)
      .get("/cases")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("cases");
    expect(Array.isArray(res.body.cases)).toBe(true);
  });

  it("should update case status", async () => {
    const res = await request(app)
      .patch(`/cases/${caseId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "investigating",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("case");
    expect(res.body.case.status).toBe("investigating");
  });

  it("should filter cases by status", async () => {
    const res = await request(app)
      .get("/cases?status=investigating")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("cases");
    expect(Array.isArray(res.body.cases)).toBe(true);

    for (const item of res.body.cases) {
      expect(item.status).toBe("investigating");
    }
  });

  it("should limit cases", async () => {
    const res = await request(app)
      .get("/cases?limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.cases.length).toBeLessThanOrEqual(1);
  });
});

afterAll(async () => {
  await pool.end();
});

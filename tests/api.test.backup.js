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

describe("Blacklist API", () => {
  let token;
  let blacklistId;

  beforeAll(async () => {
    const email = `blacklist_${Date.now()}@example.com`;
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

  it("should create a blacklist entry", async () => {
    const res = await request(app)
      .post("/blacklist")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entityType: "email",
        entityValue: "fraud@test.com",
        reason: "Known synthetic fraud source",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("blacklist");
    expect(res.body.blacklist.entityType).toBe("email");
    expect(res.body.blacklist.entityValue).toBe("fraud@test.com");

    blacklistId = res.body.blacklist.id;
  });

  it("should return blacklist entries for user", async () => {
    const res = await request(app)
      .get("/blacklist")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("blacklist");
    expect(Array.isArray(res.body.blacklist)).toBe(true);
  });

  it("should delete a blacklist entry", async () => {
    const res = await request(app)
      .delete(`/blacklist/${blacklistId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("blacklist");
    expect(res.body.blacklist.id).toBe(blacklistId);
  });

  it("should not allow blacklist access without token", async () => {
    const res = await request(app).get("/blacklist");

    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  await pool.end();
});

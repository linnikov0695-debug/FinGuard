import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/db.js";

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

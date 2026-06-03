import { pool } from "../../config/db.js";
import { createAuditLog } from "../auditLogs/auditLogs.service.js";

function mapCase(row) {
  return {
    id: row.id,
    userId: row.user_id,
    alertId: row.alert_id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCaseService(userId, data) {
  const { alertId, title, description } = data;

  const result = await pool.query(
    `INSERT INTO cases (user_id, alert_id, title, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, alert_id, title, description, status, created_at, updated_at`,
    [userId, alertId, title, description || null]
  );

  return mapCase(result.rows[0]);
}

export async function getUserCases(userId, options = {}) {
  const { status, limit = 10, page = 1, sort = "desc" } = options;

  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const offset = (safePage - 1) * safeLimit;

  let query = `
    SELECT id, user_id, alert_id, title, description, status, created_at, updated_at
    FROM cases
    WHERE user_id = $1
  `;

  const values = [userId];
  let index = 2;

  if (status) {
    query += ` AND status = $${index}`;
    values.push(status);
    index++;
  }

  const order = sort === "asc" ? "ASC" : "DESC";
  query += ` ORDER BY created_at ${order}`;

  query += ` LIMIT $${index}`;
  values.push(safeLimit);
  index++;

  query += ` OFFSET $${index}`;
  values.push(offset);

  const result = await pool.query(query, values);

  return result.rows.map(mapCase);
}

export async function updateCaseStatus(userId, caseId, status) {
  const existingCaseResult = await pool.query(
    `SELECT id, status
     FROM cases
     WHERE id = $1 AND user_id = $2`,
    [caseId, userId]
  );

  const existingCase = existingCaseResult.rows[0];

  if (!existingCase) {
    return undefined;
  }

  const result = await pool.query(
    `UPDATE cases
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND user_id = $3
     RETURNING id, user_id, alert_id, title, description, status, created_at, updated_at`,
    [status, caseId, userId]
  );

  const updatedCase = mapCase(result.rows[0]);

  await createAuditLog({
    userId,
    entityType: "case",
    entityId: caseId,
    action: "status_changed",
    oldValue: existingCase.status,
    newValue: updatedCase.status,
  });

  return updatedCase;
}

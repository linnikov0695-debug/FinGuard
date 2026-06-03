import { pool } from "../../config/db.js";
import { createAuditLog } from "../auditLogs/auditLogs.service.js";

function mapAlert(row) {
  return {
    id: row.id,
    userId: row.user_id,
    transactionId: row.transaction_id,
    type: row.type,
    riskLevel: row.risk_level,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createAlertService(data) {
  const { userId, transactionId, type, riskLevel, message } = data;

  const result = await pool.query(
    `INSERT INTO alerts (user_id, transaction_id, type, risk_level, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, transaction_id, type, risk_level, message, status, created_at, updated_at`,
    [userId, transactionId, type, riskLevel, message]
  );

  return mapAlert(result.rows[0]);
}

export async function getUserAlerts(userId, options = {}) {
  const { riskLevel, status, limit = 10, page = 1, sort = "desc" } = options;

  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const offset = (safePage - 1) * safeLimit;

  let query = `
    SELECT id, user_id, transaction_id, type, risk_level, message, status, created_at, updated_at
    FROM alerts
    WHERE user_id = $1
  `;

  const values = [userId];
  let index = 2;

  if (riskLevel) {
    query += ` AND risk_level = $${index}`;
    values.push(riskLevel);
    index++;
  }

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

  return result.rows.map(mapAlert);
}

export async function updateAlertStatus(userId, alertId, status) {
  const existingAlertResult = await pool.query(
    `SELECT id, status
     FROM alerts
     WHERE id = $1 AND user_id = $2`,
    [alertId, userId]
  );

  const existingAlert = existingAlertResult.rows[0];

  if (!existingAlert) {
    return undefined;
  }

  const result = await pool.query(
    `UPDATE alerts
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 AND user_id = $3
     RETURNING id, user_id, transaction_id, type, risk_level, message, status, created_at, updated_at`,
    [status, alertId, userId]
  );

  const updatedAlert = mapAlert(result.rows[0]);

  await createAuditLog({
    userId,
    entityType: "alert",
    entityId: alertId,
    action: "status_changed",
    oldValue: existingAlert.status,
    newValue: updatedAlert.status,
  });

  return updatedAlert;
}

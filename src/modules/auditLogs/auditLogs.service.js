import { pool } from "../../config/db.js";

function mapAuditLog(row) {
  return {
    id: row.id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    oldValue: row.old_value,
    newValue: row.new_value,
    createdAt: row.created_at,
  };
}

export async function createAuditLog(data) {
  const { userId, entityType, entityId, action, oldValue, newValue } = data;

  const result = await pool.query(
    `INSERT INTO audit_logs (
       user_id,
       entity_type,
       entity_id,
       action,
       old_value,
       new_value
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, entity_type, entity_id, action, old_value, new_value, created_at`,
    [userId, entityType, entityId, action, oldValue, newValue]
  );

  return mapAuditLog(result.rows[0]);
}

export async function getUserAuditLogs(userId) {
  const result = await pool.query(
    `SELECT id, user_id, entity_type, entity_id, action, old_value, new_value, created_at
     FROM audit_logs
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows.map(mapAuditLog);
}

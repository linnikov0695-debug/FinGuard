import { pool } from "../../config/db.js";

function mapBlacklistEntry(row) {
  return {
    id: row.id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityValue: row.entity_value,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function createBlacklistEntry(userId, data) {
  const { entityType, entityValue, reason } = data;

  const result = await pool.query(
    `INSERT INTO blacklist (
       user_id,
       entity_type,
       entity_value,
       reason
     )
     VALUES ($1, $2, $3, $4)
     RETURNING id,
               user_id,
               entity_type,
               entity_value,
               reason,
               created_at`,
    [userId, entityType, entityValue, reason || null]
  );

  return mapBlacklistEntry(result.rows[0]);
}

export async function getUserBlacklist(userId) {
  const result = await pool.query(
    `SELECT id,
            user_id,
            entity_type,
            entity_value,
            reason,
            created_at
     FROM blacklist
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows.map(mapBlacklistEntry);
}

export async function deleteBlacklistEntry(userId, entryId) {
  const result = await pool.query(
    `DELETE FROM blacklist
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, entity_type, entity_value, reason, created_at`,
    [entryId, userId]
  );

  return result.rows[0] ? mapBlacklistEntry(result.rows[0]) : undefined;
}

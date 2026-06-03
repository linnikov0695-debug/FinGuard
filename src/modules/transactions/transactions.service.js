import { pool } from "../../config/db.js";
import { createAlertService } from "../alerts/alerts.service.js";
import { evaluateRisk } from "../risk/risk.service.js";

function mapTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    currency: row.currency,
    type: row.type,
    entityType: row.entity_type,
    entityValue: row.entity_value,
    createdAt: row.created_at,
  };
}

export async function createTransactionService(data) {
  const { userId, amount, currency, type, entityType, entityValue } = data;

  const result = await pool.query(
    `INSERT INTO transactions (user_id, amount, currency, type, entity_type, entity_value)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, amount, currency, type, entity_type, entity_value, created_at`,
    [userId, amount, currency, type, entityType ?? null, entityValue ?? null]
  );

  const transaction = result.rows[0];

  const risk = await evaluateRisk(userId, transaction);

  if (risk) {
    await createAlertService({
      userId,
      transactionId: transaction.id,
      type: risk.type,
      riskLevel: risk.riskLevel,
      message: risk.message,
    });
  }

  return mapTransaction(transaction);
}

export async function getUserTransactions(userId) {
  const result = await pool.query(
    `SELECT id, user_id, amount, currency, type, entity_type, entity_value, created_at
     FROM transactions
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows.map(mapTransaction);
}

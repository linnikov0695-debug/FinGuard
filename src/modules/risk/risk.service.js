import { pool } from "../../config/db.js";

import {
  buildBlacklistRisk,
  buildMultipleHighRiskAlertsRisk,
  buildRapidTransactionsRisk,
  evaluateAmountRisk,
  evaluateTransactionTypeRisk,
} from "./risk.rules.js";

async function isBlacklisted(userId, entityType, entityValue) {
  if (!entityType || !entityValue) {
    return false;
  }

  const result = await pool.query(
    `SELECT id
     FROM blacklist
     WHERE user_id = $1
       AND entity_type = $2
       AND entity_value = $3
     LIMIT 1`,
    [userId, entityType, entityValue]
  );

  return result.rows.length > 0;
}

async function hasRapidTransactions(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM transactions
     WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '5 minutes'`,
    [userId]
  );

  return result.rows[0].count >= 3;
}

async function hasMultipleHighRiskAlerts(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM alerts
     WHERE user_id = $1
       AND status = 'open'
       AND risk_level IN ('high', 'critical')`,
    [userId]
  );

  return result.rows[0].count >= 2;
}

export async function evaluateRisk(userId, transaction) {
  const blacklisted = await isBlacklisted(
    userId,
    transaction.entity_type,
    transaction.entity_value
  );

  if (blacklisted) {
    return buildBlacklistRisk(transaction);
  }

  const multipleHighRiskAlerts = await hasMultipleHighRiskAlerts(userId);

  if (multipleHighRiskAlerts) {
    return buildMultipleHighRiskAlertsRisk();
  }

  const rapidTransactions = await hasRapidTransactions(userId);

  if (rapidTransactions) {
    return buildRapidTransactionsRisk();
  }

  const amountRisk = evaluateAmountRisk(transaction);

  if (amountRisk) {
    return amountRisk;
  }

  const transactionTypeRisk = evaluateTransactionTypeRisk(transaction);

  if (transactionTypeRisk) {
    return transactionTypeRisk;
  }

  return null;
}

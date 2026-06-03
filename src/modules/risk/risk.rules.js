export function buildBlacklistRisk(transaction) {
  return {
    type: "BLACKLIST_MATCH",
    riskLevel: "critical",
    message: `${transaction.entity_type} ${transaction.entity_value} matched blacklist.`,
  };
}

export function buildRapidTransactionsRisk() {
  return {
    type: "RAPID_TRANSACTIONS",
    riskLevel: "medium",
    message: "Multiple transactions detected within a short time window.",
  };
}

export function buildMultipleHighRiskAlertsRisk() {
  return {
    type: "MULTIPLE_HIGH_RISK_ALERTS",
    riskLevel: "high",
    message: "Multiple open high-risk alerts detected for this user.",
  };
}

export function evaluateAmountRisk(transaction) {
  const amount = Number(transaction.amount);

  if (amount >= 50000) {
    return {
      type: "CRITICAL_AMOUNT",
      riskLevel: "critical",
      message: `Transaction of ${amount} ${transaction.currency} exceeds critical threshold.`,
    };
  }

  if (amount >= 10000) {
    return {
      type: "HIGH_AMOUNT",
      riskLevel: "high",
      message: `Transaction of ${amount} ${transaction.currency} exceeds threshold.`,
    };
  }

  return null;
}

export function evaluateTransactionTypeRisk(transaction) {
  const amount = Number(transaction.amount);

  if (
    (transaction.type === "withdrawal" || transaction.type === "transfer") &&
    amount >= 5000
  ) {
    return {
      type: "SUSPICIOUS_WITHDRAWAL_OR_TRANSFER",
      riskLevel: "medium",
      message: `${transaction.type} transaction of ${amount} ${transaction.currency} is considered suspicious.`,
    };
  }

  return null;
}

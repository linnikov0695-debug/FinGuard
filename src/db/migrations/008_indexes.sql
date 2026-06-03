CREATE INDEX IF NOT EXISTS idx_transactions_user_id
ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id_created_at
ON alerts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id_status
ON alerts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_cases_user_id_status
ON cases(user_id, status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at
ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blacklist_user_id_entity
ON blacklist(user_id, entity_type, entity_value);
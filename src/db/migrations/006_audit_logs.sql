CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,

  action VARCHAR(50) NOT NULL,

  old_value TEXT,
  new_value TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
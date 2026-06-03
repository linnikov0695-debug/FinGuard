CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  alert_id INTEGER NOT NULL
    REFERENCES alerts(id)
    ON DELETE CASCADE,

  title VARCHAR(100) NOT NULL,
  description TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'investigating', 'closed')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
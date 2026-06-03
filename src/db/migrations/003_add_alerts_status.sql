ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'open';

ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'alerts_status_check'
    ) THEN
        ALTER TABLE alerts
        ADD CONSTRAINT alerts_status_check
        CHECK (status IN ('open', 'reviewed', 'resolved'));
    END IF;
END $$;

       
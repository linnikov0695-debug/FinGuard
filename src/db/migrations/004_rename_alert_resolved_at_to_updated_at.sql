DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'alerts'
      AND column_name = 'resolved_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'alerts'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE alerts
    RENAME COLUMN resolved_at TO updated_at;
  END IF;
END $$;
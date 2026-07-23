-- Refactor comments from thread-only ownership to generic target ownership.
-- Existing forum comments are migrated to target_type='THREAD'.

ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS target_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS target_id VARCHAR(255);

UPDATE comments
SET target_type = 'THREAD',
    target_id = thread_id::TEXT
WHERE (target_type IS NULL OR target_id IS NULL)
  AND thread_id IS NOT NULL;

UPDATE comments
SET target_type = 'LEGACY',
    target_id = id::TEXT
WHERE target_type IS NULL
   OR target_id IS NULL;

ALTER TABLE comments
    ALTER COLUMN target_type SET NOT NULL,
    ALTER COLUMN target_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_thread_id_fkey;
ALTER TABLE comments DROP COLUMN IF EXISTS thread_id;

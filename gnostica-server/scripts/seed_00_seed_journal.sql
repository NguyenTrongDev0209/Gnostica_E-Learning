-- Shared journal for reversible manual seed scripts.
-- Run once before any seed that supports undo_last_seed.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS seed_runs (
    id UUID PRIMARY KEY,
    seed_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'UNDONE')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    undone_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seed_runs_completed
    ON seed_runs(status, completed_at DESC);

CREATE TABLE IF NOT EXISTS seed_run_items (
    run_id UUID NOT NULL REFERENCES seed_runs(id) ON DELETE CASCADE,
    table_name VARCHAR(63) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (run_id, table_name, record_id)
);

CREATE INDEX IF NOT EXISTS idx_seed_run_items_run_table
    ON seed_run_items(run_id, table_name);

COMMIT;

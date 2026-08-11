ALTER TABLE payouts
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100),
    ADD COLUMN IF NOT EXISTS submission_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_submission_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_submission_error VARCHAR(500);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payouts_account_idempotency_key
    ON payouts (account_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payouts_gateway_submission
    ON payouts (status, gateway_payout_id, created_at);

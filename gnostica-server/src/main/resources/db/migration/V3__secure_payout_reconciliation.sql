ALTER TABLE payouts
    ADD COLUMN IF NOT EXISTS gateway_payout_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS gateway_reference_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payouts_gateway_payout_id
    ON payouts (gateway_payout_id)
    WHERE gateway_payout_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payouts_gateway_reference_id
    ON payouts (gateway_reference_id)
    WHERE gateway_reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payouts_status_updated_at
    ON payouts (status, updated_at);

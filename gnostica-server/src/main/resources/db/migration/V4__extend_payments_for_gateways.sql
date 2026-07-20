ALTER TABLE payments
    ADD COLUMN gateway VARCHAR(32),
    ADD COLUMN gateway_transaction_no VARCHAR(255),
    ADD COLUMN bank_code VARCHAR(32),
    ADD COLUMN card_type VARCHAR(32),
    ADD COLUMN gateway_response_code VARCHAR(16),
    ADD COLUMN gateway_transaction_status VARCHAR(16),
    ADD COLUMN paid_at TIMESTAMP,
    ADD COLUMN raw_callback JSONB;

ALTER TABLE payments
    DROP CONSTRAINT IF EXISTS payments_transaction_code_key;

UPDATE payments p
SET gateway = COALESCE(NULLIF(UPPER(o.payment_method), ''), 'PAYOS'),
    gateway_transaction_no = p.transaction_code,
    paid_at = CASE WHEN p.status = 2 THEN p.created_at ELSE NULL END
FROM orders o
WHERE p.order_id = o.id;

UPDATE payments
SET gateway = 'PAYOS'
WHERE gateway IS NULL;

ALTER TABLE payments
    ALTER COLUMN gateway SET NOT NULL;

CREATE UNIQUE INDEX uq_payments_gateway_transaction
    ON payments(gateway, gateway_transaction_no)
    WHERE gateway_transaction_no IS NOT NULL;

CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_transaction_code ON payments(transaction_code);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

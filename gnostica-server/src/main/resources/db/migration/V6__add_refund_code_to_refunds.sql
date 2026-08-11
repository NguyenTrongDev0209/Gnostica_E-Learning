ALTER TABLE refunds ADD COLUMN refund_code VARCHAR(14);

-- Generate random refund code for existing records (PostgreSQL logic)
-- E.g. HT + 12 digits
UPDATE refunds SET refund_code = 'HT' || lpad(floor(random() * 1000000000000)::text, 12, '0') WHERE refund_code IS NULL;

ALTER TABLE refunds ADD CONSTRAINT uk_refunds_refund_code UNIQUE (refund_code);

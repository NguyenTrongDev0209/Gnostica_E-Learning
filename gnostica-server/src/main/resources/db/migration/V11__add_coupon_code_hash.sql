ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS code_hash VARCHAR(64);

ALTER TABLE coupons
    ALTER COLUMN code TYPE TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uk_coupons_code_hash
    ON coupons (code_hash)
    WHERE code_hash IS NOT NULL;

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS coupon_price DECIMAL(18,6) NOT NULL DEFAULT 0
        CHECK (coupon_price >= 0);

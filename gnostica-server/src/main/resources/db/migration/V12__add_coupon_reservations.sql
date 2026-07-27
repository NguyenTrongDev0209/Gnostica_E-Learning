-- A coupon keeps its issued quantity unchanged until payment succeeds.
-- reserved_quantity protects the last available uses while an order is pending.
ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS reserved_quantity INT NOT NULL DEFAULT 0;

ALTER TABLE coupons
    ADD CONSTRAINT chk_coupons_reserved_quantity_nonnegative CHECK (reserved_quantity >= 0);

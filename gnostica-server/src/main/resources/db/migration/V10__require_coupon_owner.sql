DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM coupons WHERE account_id IS NULL) THEN
        RAISE EXCEPTION
            'Cannot require coupons.account_id: existing coupons without an owner must be assigned or removed first.';
    END IF;
END $$;

ALTER TABLE coupons
    ALTER COLUMN account_id SET NOT NULL;

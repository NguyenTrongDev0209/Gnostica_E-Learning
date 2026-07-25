-- 1. Xóa các cột cũ liên quan đến từng cổng thanh toán
ALTER TABLE payments
DROP COLUMN IF EXISTS account_number,
DROP COLUMN IF EXISTS sender_bank_bin,
DROP COLUMN IF EXISTS sender_account_number,
DROP COLUMN IF EXISTS bank_code,
DROP COLUMN IF EXISTS card_type,
DROP COLUMN IF EXISTS gateway_response_code,
DROP COLUMN IF EXISTS gateway_transaction_status,
DROP COLUMN IF EXISTS raw_callback;

-- 2. Thêm cột payload (JSONB)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payload jsonb;

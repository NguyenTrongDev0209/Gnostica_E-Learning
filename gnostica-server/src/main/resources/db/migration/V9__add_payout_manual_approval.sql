-- Flyway Migration V9: Manual approval for large withdrawals (>= 5,000,000 VND)
-- Lệnh rút tiền lớn sẽ ở trạng thái 6 (AWAITING_APPROVAL) cho tới khi admin duyệt.

ALTER TABLE payouts RENAME COLUMN gateway_reference_id TO payout_code;
ALTER INDEX IF EXISTS uq_payouts_gateway_reference_id RENAME TO uq_payouts_payout_code;
ALTER TABLE payouts ADD COLUMN metadata JSONB;

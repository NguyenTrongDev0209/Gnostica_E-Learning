UPDATE payouts SET payout_code = substring(payout_code, 3) WHERE payout_code LIKE 'RT%';
UPDATE refunds SET refund_code = substring(refund_code, 3) WHERE refund_code LIKE 'HT%';
ALTER TABLE payments RENAME COLUMN transaction_code TO payment_code;
ALTER INDEX idx_payments_transaction_code RENAME TO idx_payments_payment_code;
UPDATE payments SET payment_code = o.order_code::text FROM orders o WHERE o.id = payments.order_id;

-- Add target fields to wallets for Event Sourcing
ALTER TABLE wallets ADD COLUMN target_type VARCHAR(50);
ALTER TABLE wallets ADD COLUMN target_id UUID;

-- Drop wallet_id from payouts because we are moving to dynamic balance
ALTER TABLE payouts DROP COLUMN wallet_id;

-- Create refunds table
CREATE TABLE refunds (
    id UUID PRIMARY KEY,
    order_detail_id UUID REFERENCES order_details(id) NOT NULL,
    account_id UUID REFERENCES accounts(id) NOT NULL,
    amount DECIMAL(18,6) NOT NULL,
    reason TEXT,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

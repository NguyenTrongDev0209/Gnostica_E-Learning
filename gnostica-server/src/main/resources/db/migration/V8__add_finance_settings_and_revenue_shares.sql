INSERT INTO system_configs (config_key, config_value, config_type, description, created_at, updated_at)
VALUES
    ('finance.instructor_ratio', '90', 'DECIMAL', 'Tỷ lệ doanh thu của giảng viên', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('finance.platform_ratio', '10', 'DECIMAL', 'Tỷ lệ hoa hồng nền tảng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (config_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS revenue_shares (
    id SERIAL PRIMARY KEY,
    order_detail_id UUID NOT NULL UNIQUE REFERENCES order_details(id),
    instructor_id UUID NOT NULL REFERENCES accounts(id),
    commission_id INT REFERENCES commissions(id),
    gross_amount DECIMAL(18,6) NOT NULL CHECK (gross_amount >= 0),
    discount_amount DECIMAL(18,6) NOT NULL CHECK (discount_amount >= 0),
    net_sale_amount DECIMAL(18,6) NOT NULL CHECK (net_sale_amount >= 0),
    instructor_ratio DECIMAL(5,2) NOT NULL CHECK (instructor_ratio >= 0 AND instructor_ratio <= 100),
    platform_ratio DECIMAL(5,2) NOT NULL CHECK (platform_ratio >= 0 AND platform_ratio <= 100),
    instructor_amount DECIMAL(18,6) NOT NULL CHECK (instructor_amount >= 0),
    platform_amount DECIMAL(18,6) NOT NULL CHECK (platform_amount >= 0),
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_revenue_shares_instructor_id ON revenue_shares(instructor_id);

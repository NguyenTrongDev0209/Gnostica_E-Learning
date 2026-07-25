-- Tạo bảng gifts để lưu trữ thông tin tặng khóa học
CREATE TABLE gifts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id     UUID NOT NULL REFERENCES accounts(id),
    receiver_id   UUID NOT NULL REFERENCES accounts(id),
    course_id     UUID NOT NULL REFERENCES courses(id),
    order_id      UUID REFERENCES orders(id),
    token         VARCHAR(255) NOT NULL UNIQUE,
    message       TEXT,
    status        INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    expired_at    TIMESTAMP
);

CREATE INDEX idx_gifts_token ON gifts(token);
CREATE INDEX idx_gifts_sender ON gifts(sender_id);
CREATE INDEX idx_gifts_receiver ON gifts(receiver_id);
CREATE INDEX idx_gifts_status ON gifts(status);

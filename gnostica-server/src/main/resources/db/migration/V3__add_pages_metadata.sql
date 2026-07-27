ALTER TABLE pages
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN pages.metadata IS
    'Cấu hình mở rộng của trang, ví dụ nhóm và thứ tự hiển thị trong menu Điều khoản.';

CREATE TABLE term_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    status INT NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    term_module_id INT NOT NULL REFERENCES term_modules(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    url_path VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    status INT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_term_modules_status_sort_order ON term_modules(status, sort_order);
CREATE INDEX idx_terms_module_status_sort_order ON terms(term_module_id, status, sort_order);

COMMENT ON TABLE term_modules IS 'Các mục/nhóm hiển thị trong menu Điều khoản.';
COMMENT ON TABLE terms IS 'Các trang điều khoản, chính sách và nội dung pháp lý.';
COMMENT ON COLUMN terms.url_path IS 'Đường dẫn public nhập bởi quản trị viên, ví dụ terms/instructor/rewards.';

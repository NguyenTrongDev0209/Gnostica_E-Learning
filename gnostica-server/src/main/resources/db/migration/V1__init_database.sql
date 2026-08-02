-- V1__init_database.sql
-- Database Migration Script for Gnostica E-Learning

-- ---------------------------------------------------------
-- LAYER 1: Independent Tables (No Foreign Keys)
-- ---------------------------------------------------------

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE banks (
    id SERIAL PRIMARY KEY,
    external_id INT UNIQUE,
    bank_code VARCHAR(255),
    bin VARCHAR(255) UNIQUE,
    short_name VARCHAR(255),
    logo_url VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(1000),
    alt_text VARCHAR(255),
    link_url VARCHAR(1000),
    target_type VARCHAR(50),
    position VARCHAR(50),
    sort_order INT CHECK (sort_order >= 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_banners_target_type ON banners(target_type);

CREATE TABLE hashtags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    usage_count INT CHECK (usage_count >= 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE system_configs (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50),
    description VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE term_modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    status INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES term_modules(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    status INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- LAYER 2: Tables depending on Layer 1
-- ---------------------------------------------------------

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    role_id INT REFERENCES roles(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(12),
    password VARCHAR(255),
    avatar VARCHAR(2048),
    provider VARCHAR(255),
    birth_day DATE,
    metadata JSONB,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_accounts_provider ON accounts(provider);
CREATE INDEX idx_accounts_status ON accounts(status);

-- ---------------------------------------------------------
-- LAYER 3: Tables depending on Layer 2
-- ---------------------------------------------------------

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    parent_id INT REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    thumbnail VARCHAR(255),
    color VARCHAR(255),
    sort_order INT CHECK (sort_order >= 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    avatar_url VARCHAR(2048),
    banner_url VARCHAR(2048),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    remain DECIMAL(18,6) NOT NULL CHECK (remain >= 0),
    type INT NOT NULL,
    status INT NOT NULL,
    created_at TIMESTAMP,
    available_at TIMESTAMP,
    target_type VARCHAR(50),
    target_id UUID
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id),
    code TEXT NOT NULL UNIQUE,
    code_hash VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    discount_type INT NOT NULL,
    discount_value DECIMAL(18,6) NOT NULL CHECK (discount_value > 0),
    min_discount DECIMAL(18,6) CHECK (min_discount >= 0),
    max_discount DECIMAL(18,6) CHECK (max_discount >= 0),
    quantity INT CHECK (quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    status INT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE UNIQUE INDEX uk_coupons_code_hash ON coupons (code_hash) WHERE code_hash IS NOT NULL;

CREATE TABLE devices (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    device_token VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    device_name VARCHAR(255),
    ip_address VARCHAR(50),
    is_trusted BOOLEAN,
    last_login TIMESTAMP,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE follows (
    id SERIAL PRIMARY KEY,
    follower_id UUID REFERENCES accounts(id),
    followee_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP,
    UNIQUE (follower_id, followee_id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    type VARCHAR(50),
    reference_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_notifications_account_id ON notifications(account_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    action VARCHAR(255) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP
);
CREATE INDEX idx_logs_account_id ON logs(account_id);
CREATE INDEX idx_logs_action ON logs(action);

CREATE TABLE supports (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    assignee_id UUID REFERENCES accounts(id),
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    type VARCHAR(50),
    priority INT,
    status INT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    closed_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_supports_account_id ON supports(account_id);
CREATE INDEX idx_supports_assignee_id ON supports(assignee_id);
CREATE INDEX idx_supports_status ON supports(status);

CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    instructor_ratio DECIMAL(5,2) NOT NULL CHECK (instructor_ratio >= 0 AND instructor_ratio <= 100),
    platform_ratio DECIMAL(5,2) NOT NULL CHECK (platform_ratio >= 0 AND platform_ratio <= 100),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    status INT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- ---------------------------------------------------------
-- LAYER 4: Tables depending on Layer 3
-- ---------------------------------------------------------

CREATE TABLE courses (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    category_id INT REFERENCES categories(id),
    original_course_id UUID REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail VARCHAR(255),
    price DECIMAL(18,6) NOT NULL CHECK (price >= 0),
    discount INT NOT NULL CHECK (discount >= 0 AND discount <= 100),
    level VARCHAR(50),
    promo_video VARCHAR(255),
    shared_count INT NOT NULL DEFAULT 0 CHECK (shared_count >= 0),
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    status INT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_courses_category_id_status_published ON courses(category_id, status, published_at);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_published_at ON courses(published_at);

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    topic_id INT REFERENCES topics(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    view_count INT NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    shared_count INT NOT NULL DEFAULT 0 CHECK (shared_count >= 0),
    is_locked BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_threads_topic_id ON threads(topic_id);
CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_created_at ON threads(created_at);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    topic_id INT REFERENCES topics(id),
    created_at TIMESTAMP,
    UNIQUE (account_id, topic_id)
);

CREATE TABLE account_banks (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    bank_id INT REFERENCES banks(id),
    account_number VARCHAR(255) NOT NULL,
    pin VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE (account_id, bank_id, account_number)
);

-- ---------------------------------------------------------
-- LAYER 5: Tables depending on Layer 4
-- ---------------------------------------------------------

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    original_module_id INT REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
    metadata JSONB,
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    coupon_id UUID REFERENCES coupons(id),
    total_price DECIMAL(18,6) NOT NULL CHECK (total_price >= 0),
    payment_method VARCHAR(255) NOT NULL,
    order_code BIGINT UNIQUE,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_orders_account_id ON orders(account_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    course_id UUID REFERENCES courses(id),
    status INT NOT NULL,
    created_at TIMESTAMP,
    UNIQUE (account_id, course_id)
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    original_question_id INT REFERENCES questions(id),
    content TEXT NOT NULL,
    level VARCHAR(255),
    explanation TEXT,
    answer JSONB,
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    course_id UUID REFERENCES courses(id),
    parent_id INT REFERENCES reviews(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_reviews_status ON reviews(status);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(255) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description JSONB,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    target_type VARCHAR(255),
    target_id VARCHAR(255) NOT NULL,
    type INT NOT NULL,
    value BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_votes_target ON votes(target_type, target_id);

CREATE TABLE thread_hashtags (
    id SERIAL PRIMARY KEY,
    thread_id INT REFERENCES threads(id),
    hashtag_id INT REFERENCES hashtags(id),
    created_at TIMESTAMP,
    UNIQUE (thread_id, hashtag_id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES comments(id),
    mention_id UUID REFERENCES accounts(id),
    content TEXT NOT NULL,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- ---------------------------------------------------------
-- LAYER 6: Tables depending on Layer 5
-- ---------------------------------------------------------

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES modules(id),
    original_lesson_id INT REFERENCES lessons(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(255),
    metadata JSONB,
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES modules(id),
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES modules(id),
    original_quiz_id INT REFERENCES quizzes(id),
    title VARCHAR(255) NOT NULL,
    max_attempts INT NOT NULL DEFAULT 1 CHECK (max_attempts >= 1),
    passing_score DECIMAL(5,2) NOT NULL CHECK (passing_score >= 0),
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    status INT NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE order_details (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    course_id UUID REFERENCES courses(id),
    commission_id INT REFERENCES commissions(id),
    price DECIMAL(18,6) NOT NULL CHECK (price >= 0),
    discount INT NOT NULL CHECK (discount >= 0 AND discount <= 100),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_order_details_commission_id ON order_details(commission_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    transaction_code VARCHAR(255),
    gateway VARCHAR(32) NOT NULL,
    gateway_transaction_no VARCHAR(255),
    amount DECIMAL(18,6) NOT NULL CHECK (amount > 0),
    paid_at TIMESTAMP,
    payload JSONB,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX uq_payments_gateway_transaction
    ON payments(gateway, gateway_transaction_no)
    WHERE gateway_transaction_no IS NOT NULL;
CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_transaction_code ON payments(transaction_code);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

CREATE TABLE payouts (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    account_bank_id UUID REFERENCES account_banks(id),
    amount DECIMAL(18,6) NOT NULL CHECK (amount > 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES accounts(id),
    receiver_id UUID NOT NULL REFERENCES accounts(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    order_id UUID REFERENCES orders(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    message TEXT,
    status INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expired_at TIMESTAMP
);

-- ---------------------------------------------------------
-- LAYER 7: Tables depending on Layer 6
-- ---------------------------------------------------------

CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id),
    question_id INT REFERENCES questions(id),
    sort_order INT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE (quiz_id, question_id)
);

CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    quiz_id INT REFERENCES quizzes(id),
    point DECIMAL(5,2) CHECK (point >= 0),
    total_questions INT CHECK (total_questions >= 0),
    correct_answers INT CHECK (correct_answers >= 0),
    time INT CHECK (time >= 0),
    response_detail JSONB,
    status INT NOT NULL,
    created_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    lesson_id INT REFERENCES lessons(id),
    last_watched_at VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE (account_id, lesson_id)
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    course_id UUID REFERENCES courses(id),
    order_detail_id UUID REFERENCES order_details(id),
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    certificate_url VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE (account_id, course_id)
);

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

-- ---------------------------------------------------------
-- SEED DATA
-- ---------------------------------------------------------

INSERT INTO roles (name, description, status, created_at) VALUES
('ADMIN', 'Quản trị viên hệ thống', 1, CURRENT_TIMESTAMP),
('INSTRUCTOR', 'Giảng viên', 1, CURRENT_TIMESTAMP),
('USER', 'Học viên (Người dùng mặc định)', 1, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

INSERT INTO accounts (id, role_id, email, full_name, provider, status, created_at, updated_at)
SELECT
    '00000000-0000-0000-0000-000000000001',
    r.id,
    'goslink.team@gmail.com',
    'Goslink Team',
    'GOOGLE',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM roles r
WHERE r.name = 'ADMIN'
ON CONFLICT (email) DO NOTHING;

-- MERGED SAFE SEEDS FROM FORMER V2+ MIGRATIONS

-- Public website settings. Existing values are preserved when this migration runs.
INSERT INTO system_configs (config_key, config_value, config_type, description, created_at, updated_at)
VALUES
    ('site.name', 'Gnostica', 'STRING', 'Tên website', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.tagline', 'Nền tảng học tập thông minh', 'STRING', 'Slogan website', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.logo_url', '/Gnostica_Mark.webp', 'URL', 'Logo chính', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.favicon_url', '', 'URL', 'Favicon', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.contact_email', 'gnostica.team@gmail.com', 'STRING', 'Email liên hệ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.contact_phone', '0978 070 553', 'STRING', 'Số điện thoại liên hệ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.address', 'Trường Cao đẳng FPT Polytechnic', 'TEXT', 'Địa chỉ văn phòng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('site.map_embed_url', '', 'URL', 'Đường dẫn bản đồ nhúng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('footer.description', 'Gnostica là nền tảng học tập trực tuyến hiện đại, giúp bạn khai phá tiềm năng và phát triển kỹ năng mỗi ngày.', 'TEXT', 'Giới thiệu ở chân trang', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('footer.copyright', '© 2026 Gnostica. Bản quyền thuộc về đội ngũ phát triển.', 'STRING', 'Thông tin bản quyền', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('footer.social_links', '[]', 'JSON', 'Liên kết mạng xã hội', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('footer.link_groups', '[]', 'JSON', 'Nhóm liên kết chân trang', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (config_key) DO NOTHING;


INSERT INTO banners (title, image_url, alt_text, target_type, position, sort_order, status, created_at, updated_at)
SELECT seed.title, seed.image_url, seed.alt_text, 'NONE', seed.position, seed.sort_order, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('Banner trang chủ 1', '/banner_big1.webp', 'Banner khuyến mãi 1', 'HOME_HERO', 0),
    ('Banner trang chủ 2', '/banner_big2.webp', 'Banner khuyến mãi 2', 'HOME_HERO', 1),
    ('Banner phụ 1', '/banner_small1.webp', 'Banner phụ khuyến mãi 1', 'HOME_SUB', 0),
    ('Banner phụ 2', '/banner_small2.webp', 'Banner phụ khuyến mãi 2', 'HOME_SUB', 1),
    ('Banner phụ 3', '/banner_small3.webp', 'Banner phụ khuyến mãi 3', 'HOME_SUB', 2),
    ('Banner phụ 4', '/banner_small4.webp', 'Banner phụ khuyến mãi 4', 'HOME_SUB', 3)
) AS seed(title, image_url, alt_text, position, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM banners);


INSERT INTO commissions (account_id, instructor_ratio, platform_ratio, valid_from, valid_until, status, metadata, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    90.00,
    10.00,
    '2025-01-01 00:00:00',
    '2030-12-31 23:59:59',
    1,
    '{}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- Editable content and imagery for the public About page.
INSERT INTO system_configs (config_key, config_value, config_type, description, created_at, updated_at)
VALUES
    ('about.content', '', 'JSON', 'Nội dung trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('about.hero_banner_url', '', 'URL', 'Banner đầu trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('about.solutions_banner_url', '', 'URL', 'Banner giải pháp trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('about.vision_banner_url', '', 'URL', 'Banner tầm nhìn trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (config_key) DO NOTHING;

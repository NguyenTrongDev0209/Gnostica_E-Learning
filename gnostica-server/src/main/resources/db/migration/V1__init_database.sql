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
    image_url VARCHAR(255),
    link_url VARCHAR(255),
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
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
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
    avatar VARCHAR(255),
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
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    remain DECIMAL(18,6) NOT NULL CHECK (remain >= 0),
    daily_withdrawal_count INT NOT NULL CHECK (daily_withdrawal_count >= 0),
    type INT NOT NULL,
    status INT NOT NULL,
    created_at TIMESTAMP,
    available_at TIMESTAMP
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    discount_type INT NOT NULL,
    discount_value DECIMAL(18,6) NOT NULL CHECK (discount_value > 0),
    min_discount DECIMAL(18,6) CHECK (min_discount >= 0),
    max_discount DECIMAL(18,6) CHECK (max_discount >= 0),
    quantity INT CHECK (quantity >= 0),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

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

CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    instructor_ratio DECIMAL(5,2) NOT NULL CHECK (instructor_ratio >= 0 AND instructor_ratio <= 100),
    platform_ratio DECIMAL(5,2) NOT NULL CHECK (platform_ratio >= 0 AND platform_ratio <= 100),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    status INT NOT NULL,
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

CREATE TABLE coupon_rules (
    id SERIAL PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id),
    rule_type VARCHAR(255) NOT NULL,
    rule_value VARCHAR(255) NOT NULL,
    start_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ---------------------------------------------------------
-- LAYER 5: Tables depending on Layer 4
-- ---------------------------------------------------------

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    original_module_id INT REFERENCES modules(id),
    title VARCHAR(255) NOT NULL,
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

CREATE TABLE cert_requirements (
    id SERIAL PRIMARY KEY,
    course_id UUID UNIQUE REFERENCES courses(id),
    min_progress INT CHECK (min_progress >= 0 AND min_progress <= 100),
    quizzes_passed BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
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
    target_id VARCHAR(255) NOT NULL,
    type INT NOT NULL,
    value BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

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
    thread_id INT REFERENCES threads(id),
    parent_id INT REFERENCES comments(id),
    mention_id UUID REFERENCES accounts(id),
    content TEXT NOT NULL,
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

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
    price DECIMAL(18,6) NOT NULL CHECK (price >= 0),
    discount INT NOT NULL CHECK (discount >= 0 AND discount <= 100),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    transaction_code VARCHAR(255) UNIQUE,
    amount DECIMAL(18,6) NOT NULL CHECK (amount > 0),
    account_number VARCHAR(255),
    sender_bank_bin VARCHAR(255),
    sender_account_number VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    wallet_id UUID REFERENCES wallets(id),
    account_bank_id UUID REFERENCES account_banks(id),
    amount DECIMAL(18,6) NOT NULL CHECK (amount > 0),
    status INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
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
    certifi_url VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE (account_id, course_id)
);

-- ---------------------------------------------------------
-- SEED DATA
-- ---------------------------------------------------------

INSERT INTO roles (name, description, status, created_at) VALUES
('ADMIN', 'Quản trị viên hệ thống', 1, CURRENT_TIMESTAMP),
('INSTRUCTOR', 'Giảng viên', 1, CURRENT_TIMESTAMP),
('USER', 'Học viên (Người dùng mặc định)', 1, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

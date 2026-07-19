-- Editable content and imagery for the public About page.
INSERT INTO system_configs (config_key, config_value, config_type, description, created_at, updated_at)
VALUES
    ('about.content', '', 'JSON', 'Nội dung trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('about.hero_banner_url', '', 'URL', 'Banner đầu trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('about.solutions_banner_url', '', 'URL', 'Banner giải pháp trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('about.vision_banner_url', '', 'URL', 'Banner tầm nhìn trang Giới thiệu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (config_key) DO NOTHING;

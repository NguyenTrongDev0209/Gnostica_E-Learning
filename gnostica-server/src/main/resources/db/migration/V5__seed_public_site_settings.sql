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

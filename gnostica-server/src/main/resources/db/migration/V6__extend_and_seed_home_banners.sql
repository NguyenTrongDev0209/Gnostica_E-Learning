ALTER TABLE banners ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255);
ALTER TABLE banners ALTER COLUMN image_url TYPE VARCHAR(1000);
ALTER TABLE banners ALTER COLUMN link_url TYPE VARCHAR(1000);

INSERT INTO banners (title, image_url, alt_text, target_type, position, sort_order, status, created_at, updated_at)
SELECT seed.title, seed.image_url, seed.alt_text, 'NONE', seed.position, seed.sort_order, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('Banner trang chủ 1', '/banner1.webp', 'Banner khuyến mãi 1', 'HOME_HERO', 0),
    ('Banner trang chủ 2', '/banner2.webp', 'Banner khuyến mãi 2', 'HOME_HERO', 1),
    ('Banner phụ 1', '/banner_small1.webp', 'Banner phụ khuyến mãi 1', 'HOME_SUB', 0),
    ('Banner phụ 2', '/banner_small2.webp', 'Banner phụ khuyến mãi 2', 'HOME_SUB', 1),
    ('Banner phụ 3', '/banner_small3.webp', 'Banner phụ khuyến mãi 3', 'HOME_SUB', 2),
    ('Banner phụ 4', '/banner_small4.webp', 'Banner phụ khuyến mãi 4', 'HOME_SUB', 3)
) AS seed(title, image_url, alt_text, position, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM banners);

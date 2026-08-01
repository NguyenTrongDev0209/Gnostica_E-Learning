-- Gnostica category and topic seed: 100 categories and 200 forum topics.
--
-- Prerequisite: run seed_00_seed_journal.sql once. The script is reversible
-- by undo_last_seed.sql.

BEGIN;

CREATE TEMP TABLE seed_context (
    run_id UUID PRIMARY KEY
) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.unique_category_slug(p_base TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_suffix INT := 0;
    v_candidate TEXT := p_base;
BEGIN
    WHILE EXISTS (SELECT 1 FROM categories WHERE slug = v_candidate) LOOP
        v_suffix := v_suffix + 1;
        v_candidate := p_base || '-' || v_suffix;
    END LOOP;
    RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.unique_topic_slug(p_base TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_suffix INT := 0;
    v_candidate TEXT := p_base;
BEGIN
    WHILE EXISTS (SELECT 1 FROM topics WHERE slug = v_candidate) LOOP
        v_suffix := v_suffix + 1;
        v_candidate := p_base || '-' || v_suffix;
    END LOOP;
    RETURN v_candidate;
END;
$$;

DO $$
BEGIN
    IF to_regclass('public.seed_runs') IS NULL OR to_regclass('public.seed_run_items') IS NULL THEN
        RAISE EXCEPTION 'Missing seed journal. Run seed_00_seed_journal.sql before this script.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM accounts a
        JOIN roles r ON r.id = a.role_id
        WHERE a.id = '00000000-0000-0000-0000-000000000001'::UUID
          AND r.name = 'ADMIN'
          AND a.status = 1
          AND a.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Missing active seeded ADMIN account 00000000-0000-0000-0000-000000000001.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM accounts
        WHERE role_id = 2 AND status = 1 AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Missing active account with role_id = 2 to own seeded topics.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM seed_runs
        WHERE seed_name = 'seed_02_category_topic_data.sql'
          AND status = 'COMPLETED'
    ) THEN
        RAISE EXCEPTION 'Category/topic seed seed02 already exists. Do not run this script twice.';
    END IF;
END $$;

WITH new_run AS (
    INSERT INTO seed_runs (id, seed_name, status, metadata, created_at)
    VALUES (
        gen_random_uuid(),
        'seed_02_category_topic_data.sql',
        'RUNNING',
        jsonb_build_object('seed_batch', 'gnostica-category-topic-v1', 'expected_categories', 100, 'expected_topics', 200),
        NOW()
    )
    RETURNING id
)
INSERT INTO seed_context (run_id)
SELECT id FROM new_run;

-- All categories are owned by the seeded platform administrator.
WITH parent_categories(name, slug_suffix, description, color, sort_order, status) AS (
    VALUES
        ('Công nghệ thông tin', 'cong-nghe-thong-tin', 'Kiến thức và kỹ năng công nghệ số hiện đại.', '#2563EB', 1, 1),
        ('Dữ liệu và Trí tuệ nhân tạo', 'du-lieu-va-tri-tue-nhan-tao', 'Khai thác dữ liệu và ứng dụng AI trong thực tế.', '#7C3AED', 2, 1),
        ('Thiết kế và Sáng tạo', 'thiet-ke-va-sang-tao', 'Phát triển năng lực thiết kế, nội dung và sáng tạo số.', '#DB2777', 3, 1),
        ('Kinh doanh và Khởi nghiệp', 'kinh-doanh-va-khoi-nghiep', 'Từ ý tưởng đến vận hành và phát triển doanh nghiệp.', '#EA580C', 4, 1),
        ('Marketing và Truyền thông', 'marketing-va-truyen-thong', 'Xây dựng thương hiệu và kết nối khách hàng.', '#DC2626', 5, 1),
        ('Tài chính và Đầu tư', 'tai-chinh-va-dau-tu', 'Quản lý tài chính cá nhân, doanh nghiệp và đầu tư.', '#16A34A', 6, 1),
        ('Ngoại ngữ', 'ngoai-ngu', 'Nâng cao năng lực giao tiếp trong môi trường quốc tế.', '#0891B2', 7, 1),
        ('Kỹ năng mềm', 'ky-nang-mem', 'Các kỹ năng thiết yếu cho học tập và công việc.', '#0D9488', 8, 1),
        ('Phát triển bản thân', 'phat-trien-ban-than', 'Xây dựng thói quen, tư duy và năng lực bền vững.', '#65A30D', 9, 1),
        ('Sức khỏe và Lối sống', 'suc-khoe-va-loi-song', 'Chăm sóc sức khỏe thể chất và tinh thần.', '#E11D48', 10, 1),
        ('Giáo dục và Sư phạm', 'giao-duc-va-su-pham', 'Phương pháp dạy, học và thiết kế trải nghiệm đào tạo.', '#4F46E5', 11, 1),
        ('Pháp luật và Hành chính', 'phap-luat-va-hanh-chinh', 'Kiến thức pháp lý và quy trình hành chính thiết yếu.', '#475569', 12, 1),
        ('Du lịch và Khách sạn', 'du-lich-va-khach-san', 'Nghiệp vụ dịch vụ, lưu trú và trải nghiệm du lịch.', '#0284C7', 13, 1),
        ('Ẩm thực và Dịch vụ', 'am-thuc-va-dich-vu', 'Kỹ năng chế biến, phục vụ và vận hành dịch vụ ăn uống.', '#D97706', 14, 1),
        ('Nghệ thuật và Giải trí', 'nghe-thuat-va-giai-tri', 'Khám phá các lĩnh vực nghệ thuật và sáng tạo biểu diễn.', '#9333EA', 15, 1),
        ('Nhiếp ảnh và Video', 'nhiep-anh-va-video', 'Sản xuất hình ảnh, phim và nội dung đa phương tiện.', '#BE123C', 16, 1),
        ('Khoa học tự nhiên', 'khoa-hoc-tu-nhien', 'Khám phá thế giới qua các nguyên lý khoa học.', '#059669', 17, 1),
        ('Kỹ thuật và Công nghiệp', 'ky-thuat-va-cong-nghiep', 'Kiến thức kỹ thuật ứng dụng và sản xuất hiện đại.', '#1D4ED8', 18, 1),
        ('Nông nghiệp bền vững', 'nong-nghiep-ben-vung', 'Canh tác hiện đại, chuỗi giá trị và phát triển xanh.', '#4D7C0F', 19, 0),
        ('Văn hóa và Xã hội', 'van-hoa-va-xa-hoi', 'Hiểu biết về cộng đồng, văn hóa và đời sống xã hội.', '#9F1239', 20, 0)
), inserted_parents AS (
    INSERT INTO categories (
        account_id, parent_id, name, slug, description, thumbnail, color,
        sort_order, status, created_at, updated_at
    )
    SELECT '00000000-0000-0000-0000-000000000001'::UUID, NULL, name, pg_temp.unique_category_slug(slug_suffix), description,
           'https://api.dicebear.com/9.x/shapes/svg?seed=' || slug_suffix,
           color, sort_order, status, NOW(), NOW()
    FROM parent_categories
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'categories', p.id::TEXT
FROM inserted_parents p
CROSS JOIN seed_context c;

WITH child_templates(name_prefix, slug_suffix, sort_order) AS (
    VALUES
        ('Nhập môn', 'nhap-mon', 1),
        ('Nền tảng', 'nen-tang', 2),
        ('Thực hành', 'thuc-hanh', 3),
        ('Công cụ', 'cong-cu', 4)
), inserted_children AS (
    INSERT INTO categories (
        account_id, parent_id, name, slug, description, thumbnail, color,
        sort_order, status, created_at, updated_at
    )
    SELECT '00000000-0000-0000-0000-000000000001'::UUID, p.id,
           t.name_prefix || ' ' || p.name,
           pg_temp.unique_category_slug(p.slug || '-' || t.slug_suffix),
           'Nội dung ' || lower(t.name_prefix) || ' thuộc nhóm ' || p.name || '.',
           'https://api.dicebear.com/9.x/shapes/svg?seed=' || p.slug || '-' || t.slug_suffix,
           p.color, t.sort_order, p.status, NOW(), NOW()
    FROM seed_context c
    JOIN seed_run_items item ON item.run_id = c.run_id AND item.table_name = 'categories'
    JOIN categories p ON p.id::TEXT = item.record_id AND p.parent_id IS NULL
    CROSS JOIN child_templates t
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'categories', child.id::TEXT
FROM inserted_children child
CROSS JOIN seed_context c;

DO $$
DECLARE
    v_category_count INT;
BEGIN
    SELECT count(*) INTO v_category_count
    FROM seed_run_items
    WHERE run_id = (SELECT run_id FROM seed_context)
      AND table_name = 'categories';

    IF v_category_count <> 100 THEN
        RAISE EXCEPTION 'Expected 100 seeded categories, but created %.', v_category_count;
    END IF;
END $$;

-- Each seeded category receives two distinct forum topics. The owner is chosen
-- from active role_id=2 accounts using a deterministic pseudo-random ordering,
-- which spreads topics across available instructors while keeping the seed reproducible.
WITH topic_templates(title_prefix, slug_suffix, description_prefix, sort_order) AS (
    VALUES
        ('Thảo luận và hỏi đáp', 'thao-luan', 'Không gian hỏi đáp và trao đổi về', 1),
        ('Chia sẻ kinh nghiệm', 'chia-se-kinh-nghiem', 'Nơi chia sẻ kinh nghiệm thực hành về', 2)
), seeded_categories AS (
    SELECT category.id, category.name, category.slug, row_number() OVER (ORDER BY category.id)::INT AS category_no
    FROM seed_context c
    JOIN seed_run_items item ON item.run_id = c.run_id AND item.table_name = 'categories'
    JOIN categories category ON category.id::TEXT = item.record_id
), inserted_topics AS (
    INSERT INTO topics (
        account_id, title, slug, description, avatar_url, banner_url,
        status, created_at, updated_at
    )
    SELECT owner.id,
           template.title_prefix || ': ' || category.name,
           pg_temp.unique_topic_slug(template.slug_suffix || '-' || category.slug),
           template.description_prefix || ' ' || lower(category.name) || '.',
           'https://api.dicebear.com/9.x/shapes/svg?seed=topic-' || category.slug || '-' || template.slug_suffix,
           'https://api.dicebear.com/9.x/shapes/svg?seed=banner-' || category.slug || '-' || template.slug_suffix,
           CASE WHEN (category.category_no + template.sort_order) % 11 = 0 THEN 0 ELSE 1 END,
           NOW() - ((category.category_no * 5 + template.sort_order) % 365) * INTERVAL '1 day',
           NOW() - ((category.category_no * 5 + template.sort_order - 1) % 365) * INTERVAL '1 day'
    FROM seeded_categories category
    CROSS JOIN topic_templates template
    CROSS JOIN LATERAL (
        SELECT a.id
        FROM accounts a
        WHERE a.role_id = 2
          AND a.status = 1
          AND a.deleted_at IS NULL
        ORDER BY md5(category.slug || template.slug_suffix || a.id::TEXT)
        LIMIT 1
    ) owner
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'topics', topic.id::TEXT
FROM inserted_topics topic
CROSS JOIN seed_context c;

DO $$
DECLARE
    v_topic_count INT;
BEGIN
    SELECT count(*) INTO v_topic_count
    FROM seed_run_items
    WHERE run_id = (SELECT run_id FROM seed_context)
      AND table_name = 'topics';

    IF v_topic_count <> 200 THEN
        RAISE EXCEPTION 'Expected 200 seeded topics, but created %.', v_topic_count;
    END IF;
END $$;

UPDATE seed_runs
SET status = 'COMPLETED', completed_at = NOW()
WHERE id = (SELECT run_id FROM seed_context);

SELECT
    CASE WHEN parent_id IS NULL THEN 'parent' ELSE 'child' END AS category_type,
    CASE WHEN status = 1 THEN 'active' ELSE 'hidden' END AS status,
    count(*) AS categories_created
FROM categories
JOIN seed_run_items item ON item.table_name = 'categories' AND item.record_id = categories.id::TEXT
JOIN seed_context c ON c.run_id = item.run_id
GROUP BY CASE WHEN parent_id IS NULL THEN 'parent' ELSE 'child' END,
         CASE WHEN status = 1 THEN 'active' ELSE 'hidden' END
ORDER BY category_type, status;

SELECT
    count(*) AS topics_created,
    count(DISTINCT account_id) AS topic_owners,
    count(*) FILTER (WHERE status = 1) AS active_topics,
    count(*) FILTER (WHERE status = 0) AS hidden_topics
FROM topics
JOIN seed_run_items item ON item.table_name = 'topics' AND item.record_id = topics.id::TEXT
JOIN seed_context c ON c.run_id = item.run_id;

COMMIT;

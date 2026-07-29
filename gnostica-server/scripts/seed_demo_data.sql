-- Gnostica demo seed
--
-- This is an intentionally manual seed script, not a Flyway migration.
-- It creates 999 learner accounts, 36 categories, 150 courses, 1,500 modules,
-- and 15,000 lessons. It is safe only for a fresh/demo database.
--
-- STEP 1: Put the UUIDs of existing INSTRUCTOR accounts in the array below.
-- An AI agent must ask for these UUIDs when the array is empty.
-- Example: ARRAY['11111111-1111-1111-1111-111111111111'::uuid]

BEGIN;

CREATE TEMP TABLE seed_instructor_ids (
    account_id UUID PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO seed_instructor_ids (account_id)
SELECT DISTINCT supplied_id
FROM unnest(ARRAY[
    '0f91481a-107e-476a-b7e2-203ff565d86a'::uuid,
    '66ac20ed-1168-4ffd-828d-1642d3593afb'::uuid,
    'd966e67c-821f-41e0-9d03-7583e0211983'::uuid
]::UUID[]) AS supplied_id;

DO $$
DECLARE
    missing_ids TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM seed_instructor_ids) THEN
        RAISE EXCEPTION 'Missing instructor UUIDs. Add one or more UUIDs to ARRAY[] at the top of scripts/seed_demo_data.sql.';
    END IF;

    SELECT string_agg(i.account_id::TEXT, ', ')
    INTO missing_ids
    FROM seed_instructor_ids i
    LEFT JOIN accounts a ON a.id = i.account_id AND a.deleted_at IS NULL
    LEFT JOIN roles r ON r.id = a.role_id AND r.name = 'INSTRUCTOR' AND r.status = 1
    WHERE r.id IS NULL;

    IF missing_ids IS NOT NULL THEN
        RAISE EXCEPTION 'These UUIDs do not belong to active INSTRUCTOR accounts: %', missing_ids;
    END IF;

    IF EXISTS (
        SELECT 1 FROM courses
        WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
    ) THEN
        RAISE EXCEPTION 'Demo seed gnostica-demo-v1 already exists. Do not run this script twice.';
    END IF;
END $$;

-- 999 fictional learners. Names are natural Vietnamese names; only the email
-- sequence is numbered so that its uniqueness is obvious in a demo database.
WITH name_parts AS (
    SELECT
        ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ']::TEXT[] AS family_names,
        ARRAY['Minh', 'Thảo', 'Quốc', 'Gia', 'Anh', 'Khánh', 'Thanh', 'Phương', 'Hữu', 'Bảo']::TEXT[] AS middle_names,
        ARRAY['Anh', 'An', 'Bình', 'Châu', 'Duy', 'Giang', 'Hân', 'Huy', 'Khang', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Ngọc', 'Nhi', 'Phúc', 'Quân', 'Trang', 'Vy']::TEXT[] AS given_names
), learner_role AS (
    SELECT id FROM roles WHERE name = 'USER' AND status = 1
)
INSERT INTO accounts (
    id, role_id, email, full_name, avatar, provider, birth_day, metadata,
    status, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    learner_role.id,
    'student' || lpad(n::TEXT, 3, '0') || '@gmail.com',
    family_names[1 + ((n - 1) % array_length(family_names, 1))] || ' ' ||
    middle_names[1 + (((n * 3) - 1) % array_length(middle_names, 1))] || ' ' ||
    given_names[1 + (((n * 7) - 1) % array_length(given_names, 1))],
    'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg',
    CASE WHEN n % 5 = 0 THEN 'GOOGLE' ELSE 'EMAIL' END,
    DATE '1990-01-01' + ((n * 13) % 9000),
    jsonb_build_object('seed_batch', 'gnostica-demo-v1', 'kind', 'learner', 'activity_segment', CASE WHEN n % 9 = 0 THEN 'low_activity' WHEN n % 4 = 0 THEN 'high_activity' ELSE 'regular' END),
    CASE WHEN n % 41 = 0 THEN 2 WHEN n % 17 = 0 THEN 0 ELSE 1 END,
    NOW() - (((n * 17) % 720) * INTERVAL '1 day'),
    NOW() - (((n * 17) % 720) * INTERVAL '1 day') + (((n % 30) + 1) * INTERVAL '1 day')
FROM generate_series(1, 999) AS n
CROSS JOIN name_parts
CROSS JOIN learner_role;

-- Six parent categories and thirty child categories used by the course catalog.
INSERT INTO categories (account_id, parent_id, name, slug, description, thumbnail, color, sort_order, status, created_at, updated_at)
VALUES
    (NULL, NULL, 'Công nghệ thông tin', 'seed-cong-nghe-thong-tin', 'Kiến thức và kỹ năng công nghệ hiện đại', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg', '#2563EB', 1, 1, NOW(), NOW()),
    (NULL, NULL, 'Dữ liệu và trí tuệ nhân tạo', 'seed-du-lieu-va-tri-tue-nhan-tao', 'Khai thác dữ liệu và ứng dụng AI', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg', '#7C3AED', 2, 1, NOW(), NOW()),
    (NULL, NULL, 'Thiết kế và sáng tạo', 'seed-thiet-ke-va-sang-tao', 'Thiết kế trải nghiệm và nội dung số', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg', '#DB2777', 3, 1, NOW(), NOW()),
    (NULL, NULL, 'Kinh doanh và tiếp thị', 'seed-kinh-doanh-va-tiep-thi', 'Phát triển thương hiệu và năng lực kinh doanh', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg', '#EA580C', 4, 1, NOW(), NOW()),
    (NULL, NULL, 'Ngoại ngữ và giao tiếp', 'seed-ngoai-ngu-va-giao-tiep', 'Năng lực ngôn ngữ cho học tập và công việc', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg', '#059669', 5, 1, NOW(), NOW()),
    (NULL, NULL, 'Phát triển bản thân', 'seed-phat-trien-ban-than', 'Kỹ năng làm việc hiệu quả và bền vững', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg', '#0891B2', 6, 1, NOW(), NOW());

WITH child_categories(parent_slug, name, slug, description, color, sort_order) AS (
    VALUES
        ('seed-cong-nghe-thong-tin', 'Lập trình Web', 'seed-lap-trinh-web', 'Xây dựng ứng dụng web hiện đại', '#2563EB', 1),
        ('seed-cong-nghe-thong-tin', 'Java và Spring Boot', 'seed-java-va-spring-boot', 'Phát triển backend với Java', '#2563EB', 2),
        ('seed-cong-nghe-thong-tin', 'Phát triển ứng dụng Mobile', 'seed-phat-trien-ung-dung-mobile', 'Xây dựng ứng dụng di động', '#2563EB', 3),
        ('seed-cong-nghe-thong-tin', 'Cơ sở dữ liệu', 'seed-co-so-du-lieu', 'Thiết kế và vận hành dữ liệu', '#2563EB', 4),
        ('seed-cong-nghe-thong-tin', 'Kiểm thử phần mềm', 'seed-kiem-thu-phan-mem', 'Đảm bảo chất lượng sản phẩm số', '#2563EB', 5),
        ('seed-du-lieu-va-tri-tue-nhan-tao', 'Phân tích dữ liệu', 'seed-phan-tich-du-lieu', 'Phân tích dữ liệu phục vụ quyết định', '#7C3AED', 1),
        ('seed-du-lieu-va-tri-tue-nhan-tao', 'Machine Learning', 'seed-machine-learning', 'Học máy từ nền tảng đến ứng dụng', '#7C3AED', 2),
        ('seed-du-lieu-va-tri-tue-nhan-tao', 'AI tạo sinh', 'seed-ai-tao-sinh', 'Khai thác mô hình AI tạo sinh', '#7C3AED', 3),
        ('seed-du-lieu-va-tri-tue-nhan-tao', 'Kỹ thuật dữ liệu', 'seed-ky-thuat-du-lieu', 'Xây dựng luồng dữ liệu tin cậy', '#7C3AED', 4),
        ('seed-du-lieu-va-tri-tue-nhan-tao', 'Trực quan hóa dữ liệu', 'seed-truc-quan-hoa-du-lieu', 'Kể chuyện bằng dữ liệu', '#7C3AED', 5),
        ('seed-thiet-ke-va-sang-tao', 'Thiết kế UI UX', 'seed-thiet-ke-ui-ux', 'Thiết kế trải nghiệm người dùng', '#DB2777', 1),
        ('seed-thiet-ke-va-sang-tao', 'Thiết kế đồ họa', 'seed-thiet-ke-do-hoa', 'Nền tảng hình ảnh và bố cục', '#DB2777', 2),
        ('seed-thiet-ke-va-sang-tao', 'Thiết kế sản phẩm số', 'seed-thiet-ke-san-pham-so', 'Tư duy sản phẩm lấy người dùng làm trung tâm', '#DB2777', 3),
        ('seed-thiet-ke-va-sang-tao', 'Dựng phim và Motion', 'seed-dung-phim-va-motion', 'Sản xuất nội dung chuyển động', '#DB2777', 4),
        ('seed-thiet-ke-va-sang-tao', 'Sáng tạo nội dung', 'seed-sang-tao-noi-dung', 'Lên ý tưởng và phát triển nội dung', '#DB2777', 5),
        ('seed-kinh-doanh-va-tiep-thi', 'Digital Marketing', 'seed-digital-marketing', 'Tiếp thị trên các nền tảng số', '#EA580C', 1),
        ('seed-kinh-doanh-va-tiep-thi', 'Xây dựng thương hiệu', 'seed-xay-dung-thuong-hieu', 'Định vị và phát triển thương hiệu', '#EA580C', 2),
        ('seed-kinh-doanh-va-tiep-thi', 'Bán hàng chuyên nghiệp', 'seed-ban-hang-chuyen-nghiep', 'Kỹ năng bán hàng tư vấn', '#EA580C', 3),
        ('seed-kinh-doanh-va-tiep-thi', 'Quản trị dự án', 'seed-quan-tri-du-an', 'Lập kế hoạch và điều phối dự án', '#EA580C', 4),
        ('seed-kinh-doanh-va-tiep-thi', 'Khởi nghiệp', 'seed-khoi-nghiep', 'Từ ý tưởng đến mô hình kinh doanh', '#EA580C', 5),
        ('seed-ngoai-ngu-va-giao-tiep', 'Tiếng Anh giao tiếp', 'seed-tieng-anh-giao-tiep', 'Giao tiếp tiếng Anh tự tin', '#059669', 1),
        ('seed-ngoai-ngu-va-giao-tiep', 'Tiếng Anh công sở', 'seed-tieng-anh-cong-so', 'Tiếng Anh trong môi trường làm việc', '#059669', 2),
        ('seed-ngoai-ngu-va-giao-tiep', 'Thuyết trình', 'seed-thuyet-trinh', 'Truyền đạt ý tưởng thuyết phục', '#059669', 3),
        ('seed-ngoai-ngu-va-giao-tiep', 'Giao tiếp đa văn hóa', 'seed-giao-tiep-da-van-hoa', 'Làm việc hiệu quả với đội ngũ đa dạng', '#059669', 4),
        ('seed-ngoai-ngu-va-giao-tiep', 'Viết chuyên nghiệp', 'seed-viet-chuyen-nghiep', 'Viết rõ ràng và có mục tiêu', '#059669', 5),
        ('seed-phat-trien-ban-than', 'Quản lý thời gian', 'seed-quan-ly-thoi-gian', 'Tổ chức công việc hiệu quả', '#0891B2', 1),
        ('seed-phat-trien-ban-than', 'Tư duy phản biện', 'seed-tu-duy-phan-bien', 'Phân tích và đánh giá thông tin', '#0891B2', 2),
        ('seed-phat-trien-ban-than', 'Làm việc nhóm', 'seed-lam-viec-nhom', 'Hợp tác và giải quyết vấn đề', '#0891B2', 3),
        ('seed-phat-trien-ban-than', 'Kỹ năng lãnh đạo', 'seed-ky-nang-lanh-dao', 'Dẫn dắt đội ngũ với sự tin cậy', '#0891B2', 4),
        ('seed-phat-trien-ban-than', 'Năng suất cá nhân', 'seed-nang-suat-ca-nhan', 'Xây dựng thói quen làm việc bền vững', '#0891B2', 5)
)
INSERT INTO categories (account_id, parent_id, name, slug, description, thumbnail, color, sort_order, status, created_at, updated_at)
SELECT NULL, p.id, c.name, c.slug, c.description,
       'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg',
       c.color, c.sort_order, 1, NOW(), NOW()
FROM child_categories c
JOIN categories p ON p.slug = c.parent_slug;

DO $$
DECLARE
    v_category RECORD;
    v_course_id UUID;
    v_module_id INTEGER;
    v_course_no INTEGER := 0;
    v_module_no INTEGER;
    v_lesson_no INTEGER;
    v_template_no INTEGER;
    v_owner_id UUID;
    v_instructor_count INTEGER;
    v_course_status INTEGER;
    v_module_status INTEGER;
    v_lesson_status INTEGER;
    v_created_at TIMESTAMP;
    v_published_at TIMESTAMP;
    v_course_title TEXT;
    v_course_slug TEXT;
    v_module_titles TEXT[] := ARRAY[
        'Khởi động và định hướng',
        'Nền tảng cần thiết',
        'Quy trình làm việc hiệu quả',
        'Công cụ và kỹ thuật cốt lõi',
        'Thực hành theo tình huống',
        'Phân tích ví dụ thực tế',
        'Nâng cao chất lượng kết quả',
        'Giải quyết vấn đề thường gặp',
        'Hoàn thiện dự án cá nhân',
        'Tổng kết và kế hoạch tiếp theo'
    ];
    v_lesson_titles TEXT[] := ARRAY[
        'Xác định mục tiêu học tập',
        'Khám phá khái niệm trọng tâm',
        'Chuẩn bị môi trường thực hành',
        'Áp dụng quy trình từng bước',
        'Đọc hiểu một tình huống mẫu',
        'Thực hành với bài tập ngắn',
        'Rà soát lỗi và cải thiện kết quả',
        'Mở rộng từ kiến thức nền tảng',
        'Tự đánh giá tiến độ',
        'Tổng kết nội dung và hành động tiếp theo'
    ];
    v_course_title_templates TEXT[] := ARRAY[
        'Nền tảng %s cho người mới',
        'Thực hành %s qua dự án',
        'Tư duy và kỹ năng %s hiện đại',
        'Ứng dụng %s trong công việc',
        'Lộ trình chuyên sâu %s'
    ];
    v_image_url CONSTANT TEXT := 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg';
    v_video_id CONSTANT TEXT := 'b7cbeb53-ce23-4285-97cb-6421148aa852';
BEGIN
    SELECT count(*) INTO v_instructor_count FROM seed_instructor_ids;

    FOR v_category IN
        SELECT id, name, slug
        FROM categories
        WHERE slug IN (
            'seed-lap-trinh-web', 'seed-java-va-spring-boot', 'seed-phat-trien-ung-dung-mobile', 'seed-co-so-du-lieu', 'seed-kiem-thu-phan-mem',
            'seed-phan-tich-du-lieu', 'seed-machine-learning', 'seed-ai-tao-sinh', 'seed-ky-thuat-du-lieu', 'seed-truc-quan-hoa-du-lieu',
            'seed-thiet-ke-ui-ux', 'seed-thiet-ke-do-hoa', 'seed-thiet-ke-san-pham-so', 'seed-dung-phim-va-motion', 'seed-sang-tao-noi-dung',
            'seed-digital-marketing', 'seed-xay-dung-thuong-hieu', 'seed-ban-hang-chuyen-nghiep', 'seed-quan-tri-du-an', 'seed-khoi-nghiep',
            'seed-tieng-anh-giao-tiep', 'seed-tieng-anh-cong-so', 'seed-thuyet-trinh', 'seed-giao-tiep-da-van-hoa', 'seed-viet-chuyen-nghiep',
            'seed-quan-ly-thoi-gian', 'seed-tu-duy-phan-bien', 'seed-lam-viec-nhom', 'seed-ky-nang-lanh-dao', 'seed-nang-suat-ca-nhan'
        )
        ORDER BY slug
    LOOP
        FOR v_template_no IN 1..array_length(v_course_title_templates, 1) LOOP
            v_course_no := v_course_no + 1;
            SELECT account_id INTO v_owner_id
            FROM seed_instructor_ids
            ORDER BY account_id
            OFFSET ((v_course_no - 1) % v_instructor_count)
            LIMIT 1;

            v_course_title := format(v_course_title_templates[v_template_no], v_category.name);
            v_course_slug := v_category.slug || '-hanh-trinh-' || v_template_no;
            v_course_status := CASE
                WHEN v_course_no % 29 = 0 THEN 3 -- rejected
                WHEN v_course_no % 17 = 0 THEN 4 -- pending review
                WHEN v_course_no % 11 = 0 THEN 2 -- draft
                WHEN v_course_no % 37 = 0 THEN 0 -- hidden
                ELSE 1 -- published
            END;
            -- Keep room for later module and lesson dates while never creating future records.
            v_created_at := NOW() - ((60 + ((v_course_no * 23) % 670)) * INTERVAL '1 day');
            v_published_at := CASE WHEN v_course_status = 1
                THEN v_created_at + (((v_course_no % 14) + 1) * INTERVAL '1 day')
                ELSE NULL
            END;

            INSERT INTO courses (
                id, account_id, category_id, title, slug, description, thumbnail,
                price, discount, level, promo_video, shared_count, version_number,
                status, metadata, created_at, updated_at, published_at
            ) VALUES (
                gen_random_uuid(), v_owner_id, v_category.id, v_course_title, v_course_slug,
                format('Khóa học giúp học viên xây dựng năng lực %s thông qua nội dung cô đọng, ví dụ thực tế và hoạt động thực hành.', lower(v_category.name)),
                v_image_url, CASE WHEN v_course_no % 13 = 0 THEN 0 ELSE 299000 + ((v_course_no % 6) * 100000) END,
                CASE WHEN v_course_no % 9 = 0 THEN 30 WHEN v_course_no % 4 = 0 THEN 15 ELSE 0 END,
                CASE WHEN v_template_no <= 2 THEN 'BEGINNER' WHEN v_template_no <= 4 THEN 'INTERMEDIATE' ELSE 'ADVANCED' END,
                v_video_id, (v_course_no * 3) % 250, 1, v_course_status,
                jsonb_build_object('seed_batch', 'gnostica-demo-v1', 'outcomes', jsonb_build_array('Hiểu nguyên lý cốt lõi', 'Áp dụng vào một tình huống thực tế', 'Tự xây dựng kế hoạch phát triển kỹ năng')),
                v_created_at, v_created_at + INTERVAL '2 days', v_published_at
            ) RETURNING id INTO v_course_id;

            FOR v_module_no IN 1..10 LOOP
                v_module_status := CASE
                    WHEN v_course_status <> 1 THEN 2
                    WHEN (v_course_no + v_module_no) % 13 = 0 THEN 0
                    ELSE 1
                END;
                INSERT INTO modules (course_id, title, metadata, version_number, sort_order, status, created_at, updated_at)
                VALUES (
                    v_course_id, v_module_titles[v_module_no],
                    jsonb_build_object('seed_batch', 'gnostica-demo-v1', 'estimated_minutes', 30 + ((v_module_no * 11) % 55)),
                    1, v_module_no - 1, v_module_status,
                    v_created_at + ((v_module_no - 1) * INTERVAL '2 days'), v_created_at + ((v_module_no + 1) * INTERVAL '2 days')
                ) RETURNING id INTO v_module_id;

                FOR v_lesson_no IN 1..10 LOOP
                    v_lesson_status := CASE
                        WHEN v_module_status <> 1 THEN 2
                        WHEN (v_course_no + v_module_no + v_lesson_no) % 19 = 0 THEN 0
                        ELSE 1
                    END;
                    INSERT INTO lessons (module_id, title, content, video_url, metadata, version_number, sort_order, status, created_at, updated_at)
                    VALUES (
                        v_module_id, v_lesson_titles[v_lesson_no],
                        format('<p>Bài học này thuộc khóa <strong>%s</strong>. Bạn sẽ thực hành nội dung “%s” trong chương “%s” và ghi lại một hành động có thể áp dụng ngay.</p>',
                               v_course_title, v_lesson_titles[v_lesson_no], v_module_titles[v_module_no]),
                        v_video_id,
                        jsonb_build_object('seed_batch', 'gnostica-demo-v1', 'duration_seconds', 420 + (((v_lesson_no * 97) + (v_module_no * 41)) % 1200), 'is_preview', v_module_no = 1 AND v_lesson_no = 1),
                        1, v_lesson_no - 1, v_lesson_status,
                        v_created_at + (((v_module_no - 1) * 3 + v_lesson_no) * INTERVAL '1 day'),
                        v_created_at + (((v_module_no - 1) * 3 + v_lesson_no + 1) * INTERVAL '1 day')
                    );
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;

    IF v_course_no <> 150 THEN
        RAISE EXCEPTION 'Expected 150 courses, but generated %.', v_course_no;
    END IF;
END $$;

-- Seed default commission rule
INSERT INTO commissions (account_id, instructor_ratio, platform_ratio, valid_from, valid_until, status, metadata, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    70.00,
    30.00,
    NOW(),
    NULL,
    1,
    '{}'::jsonb,
    NOW(),
    NOW()
);

-- A concise verification report for DBeaver, psql, or an AI agent.
SELECT 'accounts' AS entity, count(*) AS created
FROM accounts WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
UNION ALL
SELECT 'categories', count(*) FROM categories WHERE slug LIKE 'seed-%'
UNION ALL
SELECT 'courses', count(*) FROM courses WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
UNION ALL
SELECT 'modules', count(*) FROM modules WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
UNION ALL
SELECT 'lessons', count(*) FROM lessons WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
ORDER BY entity;

SELECT a.id AS instructor_id, a.full_name, a.email, count(c.id) AS assigned_courses
FROM seed_instructor_ids i
JOIN accounts a ON a.id = i.account_id
LEFT JOIN courses c ON c.account_id = a.id AND c.metadata ->> 'seed_batch' = 'gnostica-demo-v1'
GROUP BY a.id, a.full_name, a.email
ORDER BY a.full_name, a.id;

COMMIT;

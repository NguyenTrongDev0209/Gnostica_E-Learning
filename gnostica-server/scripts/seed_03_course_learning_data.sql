-- Gnostica learning catalog seed: 500 courses with modules, lessons, question banks and quizzes.
--
-- Prerequisites:
--   1. Run seed_00_seed_journal.sql once.
--   2. Run seed_01_account_data.sql (or otherwise provide active INSTRUCTOR accounts).
--   3. Run seed_02_category_topic_data.sql (or otherwise provide active child categories).
--
-- The seed is insert-only and can be reverted with undo_last_seed.sql.
-- Every course and its learning content are tagged with seed_batch = gnostica-course-v1.

BEGIN;

CREATE TEMP TABLE seed_context (
    run_id UUID PRIMARY KEY
) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.unique_course_slug(p_base TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_suffix INT := 0;
    v_candidate TEXT := p_base;
BEGIN
    WHILE EXISTS (SELECT 1 FROM courses WHERE slug = v_candidate) LOOP
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
        WHERE r.name = 'INSTRUCTOR' AND r.status = 1
          AND a.status = 1 AND a.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Missing active INSTRUCTOR account. Run seed_01_account_data.sql first.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM categories
        WHERE status = 1 AND deleted_at IS NULL AND parent_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Missing active child category. Run seed_02_category_topic_data.sql first.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM seed_runs
        WHERE seed_name = 'seed_03_course_learning_data.sql' AND status = 'COMPLETED'
    ) THEN
        RAISE EXCEPTION 'Course seed already exists. Run undo_last_seed.sql before running this seed again.';
    END IF;
END $$;

WITH new_run AS (
    INSERT INTO seed_runs (id, seed_name, status, metadata, created_at)
    VALUES (
        gen_random_uuid(),
        'seed_03_course_learning_data.sql',
        'RUNNING',
        jsonb_build_object('seed_batch', 'gnostica-course-v1', 'expected_courses', 500),
        NOW()
    )
    RETURNING id
)
INSERT INTO seed_context (run_id)
SELECT id FROM new_run;

CREATE TEMP TABLE seed_instructors ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY a.id)::INT AS position, a.id AS account_id, a.status AS account_status
FROM accounts a
JOIN roles r ON r.id = a.role_id
WHERE r.name = 'INSTRUCTOR' AND r.status = 1
  AND a.deleted_at IS NULL;

CREATE TEMP TABLE seed_categories ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY id)::INT AS position, id AS category_id, status AS category_status
FROM categories
WHERE deleted_at IS NULL AND parent_id IS NOT NULL;

-- 25 genuinely different subject areas x 20 learning paths = 500 courses.
CREATE TEMP TABLE seed_course_plan (
    course_id UUID PRIMARY KEY,
    course_no INT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    skill TEXT NOT NULL,
    course_title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    account_id UUID NOT NULL,
    owner_account_status INT NOT NULL,
    category_id INT NOT NULL,
    category_status INT NOT NULL,
    price NUMERIC(18,6) NOT NULL,
    discount INT NOT NULL,
    level VARCHAR(50) NOT NULL,
    promo_video VARCHAR(255),
    status INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    module_count INT NOT NULL
) ON COMMIT DROP;

WITH subjects(subject, slug_base, skill, category_slot) AS (
    VALUES
        ('Lập trình Java từ nền tảng đến ứng dụng', 'lap-trinh-java', 'xây dựng ứng dụng Java rõ ràng, có cấu trúc và dễ bảo trì', 1),
        ('Spring Boot và REST API', 'spring-boot-rest-api', 'thiết kế dịch vụ web an toàn và có thể mở rộng', 2),
        ('Lập trình C++ hiện đại', 'lap-trinh-cpp', 'giải quyết bài toán bằng tư duy thuật toán và C++', 3),
        ('Python cho phân tích dữ liệu', 'python-phan-tich-du-lieu', 'khai thác, làm sạch và trực quan hóa dữ liệu', 4),
        ('React và Frontend hiện đại', 'react-frontend-hien-dai', 'xây dựng giao diện web có trạng thái và trải nghiệm tốt', 5),
        ('Node.js và backend thực chiến', 'nodejs-backend-thuc-chien', 'xây dựng API Node.js đáng tin cậy', 6),
        ('SQL và thiết kế cơ sở dữ liệu', 'sql-thiet-ke-co-so-du-lieu', 'mô hình hóa dữ liệu và viết truy vấn hiệu quả', 7),
        ('Docker và quy trình DevOps', 'docker-devops', 'đóng gói, triển khai và vận hành ứng dụng', 8),
        ('Kiểm thử phần mềm', 'kiem-thu-phan-mem', 'thiết kế chiến lược kiểm thử và phát hiện lỗi sớm', 9),
        ('An toàn thông tin cơ bản', 'an-toan-thong-tin', 'nhận diện rủi ro và bảo vệ hệ thống số', 10),
        ('Excel cho công việc văn phòng', 'excel-cong-viec-van-phong', 'xử lý bảng tính nhanh, chính xác và có kiểm soát', 11),
        ('Power BI trực quan hóa dữ liệu', 'power-bi-truc-quan-du-lieu', 'biến dữ liệu thành báo cáo hỗ trợ ra quyết định', 12),
        ('Trí tuệ nhân tạo ứng dụng', 'tri-tue-nhan-tao-ung-dung', 'ứng dụng AI có trách nhiệm vào công việc', 13),
        ('Machine Learning nhập môn', 'machine-learning-nhap-mon', 'xây dựng và đánh giá mô hình dự đoán cơ bản', 14),
        ('Thiết kế UI/UX', 'thiet-ke-ui-ux', 'thiết kế trải nghiệm lấy người dùng làm trung tâm', 15),
        ('Figma cho thiết kế sản phẩm', 'figma-thiet-ke-san-pham', 'tạo wireframe, prototype và bàn giao thiết kế', 16),
        ('Photoshop thiết kế ấn phẩm', 'photoshop-thiet-ke-an-pham', 'xử lý hình ảnh và xây dựng ấn phẩm số', 17),
        ('Digital Marketing tổng quan', 'digital-marketing-tong-quan', 'lập kế hoạch và triển khai chiến dịch số', 18),
        ('SEO thực hành', 'seo-thuc-hanh', 'tối ưu nội dung và kỹ thuật để tăng khả năng tìm thấy', 19),
        ('Content Marketing', 'content-marketing', 'xây dựng nội dung nhất quán với mục tiêu kinh doanh', 20),
        ('Kỹ năng bán hàng tư vấn', 'ky-nang-ban-hang-tu-van', 'khám phá nhu cầu và tư vấn giải pháp phù hợp', 21),
        ('Quản lý dự án', 'quan-ly-du-an', 'lập kế hoạch, theo dõi và điều phối dự án', 22),
        ('Kỹ năng thuyết trình', 'ky-nang-thuyet-trinh', 'trình bày ý tưởng tự tin, mạch lạc và thuyết phục', 23),
        ('Tiếng Anh giao tiếp công sở', 'tieng-anh-giao-tiep-cong-so', 'giao tiếp tiếng Anh chuyên nghiệp trong môi trường làm việc', 24),
        ('Nhiếp ảnh và kể chuyện bằng hình ảnh', 'nhiep-anh-ke-chuyen-hinh-anh', 'tạo bộ ảnh có chủ đề, bố cục và thông điệp rõ ràng', 25)
), tracks(track_no, title_suffix, learning_goal) AS (
    VALUES
        (1, 'Nhập môn dành cho người mới', 'xây nền tảng vững chắc'),
        (2, 'Từ cơ bản đến dự án đầu tay', 'hoàn thiện một sản phẩm đầu tiên'),
        (3, 'Thực hành theo tình huống công việc', 'vận dụng vào công việc hằng ngày'),
        (4, 'Lộ trình 30 ngày có hướng dẫn', 'hình thành nhịp học đều đặn'),
        (5, 'Xây dựng portfolio cá nhân', 'tạo sản phẩm có thể đưa vào portfolio'),
        (6, 'Tối ưu quy trình làm việc', 'cải thiện tốc độ và chất lượng đầu ra'),
        (7, 'Chuyên sâu kỹ năng cốt lõi', 'nâng cao năng lực thực hành'),
        (8, 'Giải quyết lỗi và tình huống thường gặp', 'tự tin xử lý vấn đề thực tế'),
        (9, 'Thực chiến với dự án mô phỏng', 'rèn luyện tư duy triển khai'),
        (10, 'Ôn luyện có hệ thống', 'củng cố kiến thức theo lộ trình'),
        (11, 'Dành cho người chuyển ngành', 'kết nối kiến thức mới với kinh nghiệm sẵn có'),
        (12, 'Nâng cấp năng suất cá nhân', 'làm việc chủ động và nhất quán hơn'),
        (13, 'Tư duy nền tảng và phương pháp', 'hiểu bản chất thay vì học thuộc'),
        (14, 'Thực hành có phản biện', 'đánh giá và cải thiện chất lượng đầu ra'),
        (15, 'Bản cập nhật 2026', 'tiếp cận công cụ và cách làm hiện hành'),
        (16, 'Từ ý tưởng đến sản phẩm hoàn chỉnh', 'biến ý tưởng thành kết quả có thể sử dụng'),
        (17, 'Kỹ năng làm việc nhóm', 'phối hợp hiệu quả với các bên liên quan'),
        (18, 'Học qua case study', 'rút kinh nghiệm từ các tình huống điển hình'),
        (19, 'Củng cố kiến thức nâng cao', 'mở rộng chiều sâu chuyên môn'),
        (20, 'Chuẩn bị cho công việc thực tế', 'sẵn sàng áp dụng sau khóa học')
), generated AS (
    SELECT
        row_number() OVER (ORDER BY s.slug_base, t.track_no)::INT AS course_no,
        s.subject, s.slug_base, s.skill, s.category_slot, t.track_no, t.title_suffix, t.learning_goal
    FROM subjects s CROSS JOIN tracks t
), prepared AS (
    SELECT
        g.*,
        CASE g.course_no % 6
            WHEN 0 THEN g.subject || ': ' || g.title_suffix
            WHEN 1 THEN 'Chinh phục ' || g.subject || ' — ' || g.title_suffix
            WHEN 2 THEN g.subject || ' cho người bận rộn: ' || g.title_suffix
            WHEN 3 THEN 'Thực hành ' || g.subject || ': ' || g.title_suffix
            WHEN 4 THEN g.subject || ' theo lộ trình rõ ràng: ' || g.title_suffix
            ELSE 'Học ' || g.subject || ' qua bài tập: ' || g.title_suffix
        END AS course_title,
        CASE g.course_no % 6
            WHEN 0 THEN 'Khóa học giúp học viên ' || g.learning_goal || ' với ' || g.subject || '. Bạn sẽ lần lượt học nền tảng, thực hành trên ví dụ và tự hoàn thiện đầu ra. Mục tiêu cuối cùng là ' || g.skill || '.'
            WHEN 1 THEN 'Đây là lộ trình ' || g.subject || ' dành cho người muốn ' || g.learning_goal || '. Mỗi phần học đặt một vấn đề cụ thể, hướng dẫn cách xử lý và có checklist để bạn tự rà soát kết quả.'
            WHEN 2 THEN 'Nội dung được chia thành các phiên học ngắn, phù hợp để học đều đặn. Từ kiến thức nền đến bài thực hành, khóa học tập trung vào việc ' || g.skill || ' và áp dụng ngay vào bối cảnh quen thuộc.'
            WHEN 3 THEN 'Khóa học bắt đầu từ một tình huống gần với công việc, sau đó mở rộng thành quy trình hoàn chỉnh. Học viên được khuyến khích thử, nhận diện sai lệch và điều chỉnh để ' || g.learning_goal || '.'
            WHEN 4 THEN 'Thay vì học rời rạc, khóa học kết nối kiến thức của ' || g.subject || ' thành một lộ trình có mục tiêu. Bạn sẽ hiểu vì sao từng bước cần thiết và rèn luyện để ' || g.skill || '.'
            ELSE 'Khóa học sử dụng bài tập, ví dụ và tình huống mô phỏng để làm rõ ' || g.subject || '. Sau mỗi chương, bạn có thể tự đánh giá tiến độ và từng bước ' || g.learning_goal || '.'
        END AS description,
        5 + ((g.course_no * 7) % 6) AS module_count,
        CASE
            WHEN g.course_no % 25 IN (0, 1) THEN 0
            WHEN g.course_no % 25 IN (2, 3, 4) THEN 2
            WHEN g.course_no % 25 IN (5, 6) THEN 4
            WHEN g.course_no % 25 = 7 THEN 3
            ELSE 1
        END AS status,
        NOW() - ((35 + ((g.course_no * 19) % 680)) || ' days')::INTERVAL AS created_at
    FROM generated g
)
INSERT INTO seed_course_plan (
    course_id, course_no, subject, skill, course_title, slug, description,
    account_id, owner_account_status, category_id, category_status, price, discount, level, promo_video, status,
    created_at, updated_at, published_at, module_count
)
SELECT
    gen_random_uuid(), p.course_no, p.subject, p.skill, p.course_title,
    pg_temp.unique_course_slug(p.slug_base || '-' || p.track_no), p.description,
    i.account_id, i.account_status, c.category_id, c.category_status,
    (99000 + ((p.course_no * 137000) % 1400000))::NUMERIC(18,6),
    CASE WHEN p.course_no % 9 = 0 THEN 0 ELSE 5 + ((p.course_no * 11) % 46) END,
    CASE WHEN p.course_no % 10 < 5 THEN 'beginner' WHEN p.course_no % 10 < 8 THEN 'intermediate' ELSE 'advanced' END,
    CASE WHEN p.course_no % 4 = 0 THEN NULL ELSE (ARRAY[
        'b7cbeb53-ce23-4285-97cb-6421148aa852', 'b5f1240f-bbed-45ef-907c-f93d01527918',
        '375482c2-ed32-45ef-917d-7d4a2b9257d4', '6d5e092b-4063-4a92-b3dd-64ba28fd9679',
        '2b1af695-70df-431a-a3f2-ac6ba18e7c21', '2b21f411-ac17-4289-aa31-16a5cf49f653',
        '8e2ac859-60f3-44df-b2a5-f0dee76ba0c1', 'a4bf4b9f-fb44-41fc-a65a-2b035d5cf16a',
        'f0b22fcc-7055-455c-9568-3cc474c63aa5', '84c761de-744a-4342-87ae-d635e197d832'
    ])[1 + ((p.course_no * 3) % 10)] END,
    p.status,
    p.created_at,
    p.created_at + ((1 + ((p.course_no * 5) % 21)) || ' days')::INTERVAL,
    CASE WHEN p.status = 1 THEN LEAST(
        NOW() - INTERVAL '1 hour',
        p.created_at + ((3 + ((p.course_no * 7) % 48)) || ' days')::INTERVAL
    ) ELSE NULL END,
    p.module_count
FROM prepared p
CROSS JOIN LATERAL (
    SELECT account_id, account_status
    FROM seed_instructors
    ORDER BY CASE
        WHEN p.course_no % 23 = 0 AND account_status <> 1 THEN 0
        WHEN p.course_no % 23 <> 0 AND account_status = 1 THEN 0
        ELSE 1
    END,
    ((position - p.course_no * 13 + 10000) % (SELECT count(*) FROM seed_instructors))
    LIMIT 1
) i
CROSS JOIN LATERAL (
    SELECT category_id, category_status
    FROM seed_categories
    ORDER BY CASE
        WHEN p.course_no % 13 = 0 AND category_status <> 1 THEN 0
        WHEN p.course_no % 13 <> 0 AND category_status = 1 THEN 0
        ELSE 1
    END,
    ((position - p.category_slot - p.track_no * 3 + 10000) % (SELECT count(*) FROM seed_categories))
    LIMIT 1
) c;

WITH inserted_courses AS (
    INSERT INTO courses (
        id, account_id, category_id, original_course_id, title, slug, description, thumbnail,
        price, discount, level, promo_video, shared_count, version_number, status, metadata,
        created_at, updated_at, published_at, deleted_at
    )
    SELECT
        p.course_id, p.account_id, p.category_id, NULL, p.course_title, p.slug, p.description,
        (ARRAY[
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1785042514/gnostica_forum/Smartphone_and_laptop_workspace_202607250057_eebdf091-9744-4913-94b3-0b810c8add91.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784795084/gnostica_forum/Gemini_Generated_Image_e2j0lfe2j0lfe2j0_9507f707-8b03-4566-a8ad-fef11cbb2b2c.png',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784784319/gnostica_forum/hinh-anh-may-tinh-800x450_8f872a31-5b2a-457c-8315-0e69bebcd53c.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784688876/gnostica_forum/Java%20and%20code_d6a995f7-dc84-49b1-bd05-e63f59096228.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784685336/gnostica_forum/ai%20agents3_5fa65784-9bc3-43dc-86da-9ebda834cd79.png',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_be6f0e54-81c4-40ab-a1b3-24a2d8cc3414.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1783099429/gnostica_forum/extracted_2517f1af-f901-45bc-8157-6c239bae0e83.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1782799791/gnostica_forum/hinh-anh-may-tinh-800x450_213a0692-5cd7-4632-85a2-8965b31260d4.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1779674947/gnostica_forum/C%20CODE%202_73e6a70f-c6ea-4adf-b4e4-ced6049de5eb.jpg',
            'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1776337763/gnostica_forum/work%20experiences_a37a5bf0-6bdc-4181-bc02-a3428a464f39.png'
        ])[1 + ((p.course_no * 7) % 10)],
        p.price, p.discount, p.level, p.promo_video, ((p.course_no * 17) % 860), 1, p.status,
        jsonb_build_object(
            'seed_batch', 'gnostica-course-v1', 'courseNo', p.course_no,
            'learningPath', p.course_title, 'estimatedStudyHours', 8 + ((p.course_no * 3) % 35),
            'ownerAccountStatusAtSeed', p.owner_account_status,
            'categoryStatusAtSeed', p.category_status,
            'edgeCaseOwner', p.owner_account_status <> 1,
            'edgeCaseCategory', p.category_status <> 1,
            'testScenario', CASE
                WHEN p.owner_account_status <> 1 AND p.category_status <> 1 THEN 'INACTIVE_OWNER_AND_HIDDEN_CATEGORY'
                WHEN p.owner_account_status <> 1 THEN 'INACTIVE_OWNER'
                WHEN p.category_status <> 1 THEN 'HIDDEN_CATEGORY'
                ELSE 'NORMAL'
            END
        ),
        p.created_at, p.updated_at, p.published_at, NULL
    FROM seed_course_plan p
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'courses', i.id::TEXT
FROM inserted_courses i CROSS JOIN seed_context c;

CREATE TEMP TABLE seed_module_plan (
    course_id UUID NOT NULL,
    course_no INT NOT NULL,
    module_no INT NOT NULL,
    subject TEXT NOT NULL,
    course_title TEXT NOT NULL,
    module_title TEXT NOT NULL,
    module_status INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (course_id, module_no)
) ON COMMIT DROP;

INSERT INTO seed_module_plan
SELECT
    p.course_id, p.course_no, m.module_no, p.subject, p.course_title,
    CASE m.module_no
        WHEN 1 THEN 'Định hướng học tập và chuẩn bị cho ' || p.subject
        WHEN 2 THEN 'Nền tảng và thuật ngữ cốt lõi'
        WHEN 3 THEN 'Công cụ, quy trình và môi trường thực hành'
        WHEN 4 THEN 'Kỹ thuật trọng tâm trong ' || p.subject
        WHEN 5 THEN 'Thực hành có hướng dẫn'
        WHEN 6 THEN 'Xử lý tình huống và lỗi thường gặp'
        WHEN 7 THEN 'Nâng cao chất lượng đầu ra'
        WHEN 8 THEN 'Xây dựng bài tập hoặc dự án ứng dụng'
        WHEN 9 THEN 'Rà soát, cải tiến và trình bày kết quả'
        ELSE 'Tổng kết, tự đánh giá và lộ trình tiếp theo'
    END,
    CASE
        WHEN p.status <> 1 THEN 2
        WHEN (p.course_no + m.module_no) % 17 = 0 THEN 2
        ELSE 1
    END,
    p.created_at + (m.module_no || ' days')::INTERVAL
FROM seed_course_plan p
CROSS JOIN LATERAL generate_series(1, p.module_count) AS m(module_no);

WITH inserted_modules AS (
    INSERT INTO modules (
        course_id, original_module_id, title, metadata, version_number, sort_order,
        status, created_at, updated_at, deleted_at
    )
    SELECT
        p.course_id, NULL, p.module_title,
        jsonb_build_object('seed_batch', 'gnostica-course-v1', 'courseNo', p.course_no, 'moduleNo', p.module_no,
            'learningObjective', 'Hoàn thành phần ' || p.module_no || ' trong lộ trình ' || p.subject),
        1, p.module_no, p.module_status, p.created_at, p.created_at + INTERVAL '1 day', NULL
    FROM seed_module_plan p
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'modules', i.id::TEXT
FROM inserted_modules i CROSS JOIN seed_context c;

CREATE TEMP TABLE seed_modules ON COMMIT DROP AS
SELECT
    m.id AS module_id, p.course_id, p.course_no, p.module_no, p.subject, p.course_title,
    p.module_title, p.module_status, p.created_at
FROM modules m
JOIN seed_module_plan p
  ON m.course_id = p.course_id
 AND (m.metadata ->> 'seed_batch') = 'gnostica-course-v1'
 AND (m.metadata ->> 'courseNo')::INT = p.course_no
 AND (m.metadata ->> 'moduleNo')::INT = p.module_no;

CREATE TEMP TABLE seed_lesson_plan (
    module_id INT NOT NULL,
    course_no INT NOT NULL,
    module_no INT NOT NULL,
    lesson_no INT NOT NULL,
    lesson_title TEXT NOT NULL,
    content TEXT NOT NULL,
    lesson_status INT NOT NULL,
    duration_seconds INT NOT NULL,
    lesson_kind TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (module_id, lesson_no)
) ON COMMIT DROP;

INSERT INTO seed_lesson_plan
SELECT
    m.module_id, m.course_no, m.module_no, l.lesson_no,
    CASE l.lesson_no
        WHEN 1 THEN 'Mục tiêu, đầu ra và bối cảnh của chương'
        WHEN 2 THEN 'Chuẩn bị công cụ và tài nguyên cần thiết'
        WHEN 3 THEN 'Khái niệm, nguyên tắc và cách tiếp cận'
        WHEN 4 THEN 'Thực hiện từng bước với ví dụ minh họa'
        WHEN 5 THEN 'Phân tích một tình huống thực tế'
        WHEN 6 THEN 'Bài thực hành có hướng dẫn'
        WHEN 7 THEN 'Những lỗi thường gặp và cách khắc phục'
        WHEN 8 THEN 'Mở rộng kiến thức và các lựa chọn thay thế'
        WHEN 9 THEN 'Tự đánh giá chất lượng kết quả'
        ELSE 'Tổng kết chương và bài tập tiếp theo'
    END,
    'Bài học tập trung vào “' || m.module_title || '” trong khóa “' || m.course_title || '”. '
        || CASE l.lesson_no
            WHEN 1 THEN 'Bạn sẽ xác định rõ mục tiêu, phạm vi và tiêu chí hoàn thành trước khi bắt đầu.'
            WHEN 2 THEN 'Nội dung hướng dẫn chuẩn bị môi trường, tài liệu và kiểm tra các điều kiện cần thiết.'
            WHEN 3 THEN 'Bạn sẽ hiểu các khái niệm then chốt, lý do áp dụng và các nguyên tắc cần tuân thủ.'
            WHEN 4 THEN 'Hãy theo dõi từng thao tác, đối chiếu kết quả và ghi lại những điểm cần lưu ý.'
            WHEN 5 THEN 'Tình huống mô phỏng giúp kết nối kiến thức với một bài toán gần với công việc.'
            WHEN 6 THEN 'Hoàn thành bài thực hành, tự kiểm tra đầu ra và so sánh với tiêu chí đề bài.'
            WHEN 7 THEN 'Phần này phân tích nguyên nhân phổ biến, dấu hiệu nhận biết và cách xử lý phù hợp.'
            WHEN 8 THEN 'Bạn sẽ cân nhắc các phương án khác nhau để chọn cách làm phù hợp với bối cảnh.'
            WHEN 9 THEN 'Dùng checklist để đánh giá mức độ đúng, đủ, rõ ràng và khả năng áp dụng của kết quả.'
            ELSE 'Tóm tắt các ý chính và chọn một việc cụ thể để áp dụng ngay sau bài học.'
        END,
    CASE WHEN m.module_status = 1 AND (m.course_no + m.module_no + l.lesson_no) % 19 <> 0 THEN 1 ELSE 2 END,
    360 + ((m.course_no * 97 + m.module_no * 53 + l.lesson_no * 71) % 1441),
    (ARRAY['VIDEO', 'READING', 'GUIDED_PRACTICE', 'CASE_STUDY', 'RECAP'])[1 + ((m.module_no + l.lesson_no) % 5)],
    m.created_at + ((l.lesson_no * 2) || ' hours')::INTERVAL
FROM seed_modules m
CROSS JOIN LATERAL generate_series(1, 5 + ((m.course_no * 13 + m.module_no * 7) % 6)) AS l(lesson_no);

WITH inserted_lessons AS (
    INSERT INTO lessons (
        module_id, original_lesson_id, title, content, video_url, metadata,
        version_number, sort_order, status, created_at, updated_at, deleted_at
    )
    SELECT
        p.module_id, NULL, p.lesson_title, p.content,
        (ARRAY[
            'b7cbeb53-ce23-4285-97cb-6421148aa852', 'b5f1240f-bbed-45ef-907c-f93d01527918',
            '375482c2-ed32-45ef-917d-7d4a2b9257d4', '6d5e092b-4063-4a92-b3dd-64ba28fd9679',
            '2b1af695-70df-431a-a3f2-ac6ba18e7c21', '2b21f411-ac17-4289-aa31-16a5cf49f653',
            '8e2ac859-60f3-44df-b2a5-f0dee76ba0c1', 'a4bf4b9f-fb44-41fc-a65a-2b035d5cf16a',
            'f0b22fcc-7055-455c-9568-3cc474c63aa5', '84c761de-744a-4342-87ae-d635e197d832'
        ])[1 + ((p.course_no * 5 + p.module_no * 3 + p.lesson_no) % 10)],
        jsonb_build_object('seed_batch', 'gnostica-course-v1', 'durationSeconds', p.duration_seconds,
            'lessonKind', p.lesson_kind, 'isPreview', p.lesson_no = 1),
        1, p.lesson_no, p.lesson_status, p.created_at, p.created_at + INTERVAL '1 hour', NULL
    FROM seed_lesson_plan p
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'lessons', i.id::TEXT
FROM inserted_lessons i CROSS JOIN seed_context c;

-- A quiz is attached to about 40% of visible modules. Its questions remain in the course question bank.
CREATE TEMP TABLE seed_quiz_plan (
    module_id INT PRIMARY KEY,
    course_id UUID NOT NULL,
    course_no INT NOT NULL,
    module_no INT NOT NULL,
    module_title TEXT NOT NULL,
    subject TEXT NOT NULL,
    question_count INT NOT NULL,
    quiz_title TEXT NOT NULL,
    max_attempts INT NOT NULL,
    passing_score NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_quiz_plan
SELECT
    m.module_id, m.course_id, m.course_no, m.module_no, m.module_title, m.subject,
    4 + ((m.course_no * 11 + m.module_no * 5) % 7),
    'Kiểm tra kiến thức: ' || m.module_title,
    (ARRAY[1, 2, 3, 5])[1 + ((m.course_no + m.module_no) % 4)],
    (ARRAY[60.00, 70.00, 80.00]::NUMERIC[])[1 + ((m.course_no * 3 + m.module_no) % 3)],
    m.created_at + INTERVAL '2 days'
FROM seed_modules m
WHERE m.module_status = 1 AND ((m.course_no * 17 + m.module_no * 3) % 5) < 2;

CREATE TEMP TABLE seed_question_plan (
    course_id UUID NOT NULL,
    module_id INT NOT NULL,
    question_no INT NOT NULL,
    content TEXT NOT NULL,
    level VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    answer JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (module_id, question_no)
) ON COMMIT DROP;

INSERT INTO seed_question_plan
SELECT
    q.course_id, q.module_id, n.question_no,
    (CASE n.question_no % 5
        WHEN 1 THEN 'Mục tiêu phù hợp nhất của phần “' || q.module_title || '” là gì?'
        WHEN 2 THEN 'Trước khi thực hành nội dung “' || q.module_title || '”, việc nào nên được ưu tiên?'
        WHEN 3 THEN 'Cách tiếp cận nào giúp kiểm soát chất lượng khi áp dụng “' || q.module_title || '”?'
        WHEN 4 THEN 'Khi kết quả chưa như mong muốn trong phần “' || q.module_title || '”, nên làm gì trước?'
        ELSE 'Dấu hiệu nào cho thấy bạn đã hoàn thành tốt phần “' || q.module_title || '”?'
    END) || ' (Tình huống thực hành ' || n.question_no || ')',
    (ARRAY['easy', 'medium', 'medium', 'hard'])[1 + ((n.question_no + q.module_no) % 4)],
    CASE n.question_no % 5
        WHEN 1 THEN 'Phần học hướng tới việc hiểu nguyên tắc và tạo được đầu ra có thể kiểm tra, không chỉ ghi nhớ khái niệm.'
        WHEN 2 THEN 'Chuẩn bị mục tiêu, công cụ và tiêu chí kiểm tra giúp quá trình thực hành ít sai sót hơn.'
        WHEN 3 THEN 'Làm theo từng bước, đối chiếu với tiêu chí và ghi nhận sai lệch là cách làm đáng tin cậy.'
        WHEN 4 THEN 'Cần xác định nguyên nhân, kiểm tra dữ liệu đầu vào và tái hiện vấn đề trước khi thay đổi giải pháp.'
        ELSE 'Một kết quả tốt phải đáp ứng mục tiêu, có thể giải thích được và phù hợp với bối cảnh sử dụng.'
    END,
    CASE (n.question_no + q.course_no) % 4
        WHEN 0 THEN jsonb_build_object('options', jsonb_build_object('A', 'Làm theo từng bước và đối chiếu kết quả với tiêu chí đã đặt ra', 'B', 'Bỏ qua bước kiểm tra để hoàn thành nhanh hơn', 'C', 'Chỉ sao chép kết quả mẫu mà không hiểu nguyên nhân', 'D', 'Thay đổi nhiều yếu tố cùng lúc mà không ghi nhận'), 'correct', 'A')
        WHEN 1 THEN jsonb_build_object('options', jsonb_build_object('A', 'Ghi nhớ thuật ngữ mà không cần thực hành', 'B', 'Tạo đầu ra phù hợp mục tiêu và kiểm tra được chất lượng', 'C', 'Chọn phương án nhanh nhất bất kể bối cảnh', 'D', 'Bỏ qua phản hồi để tránh phải điều chỉnh'), 'correct', 'B')
        WHEN 2 THEN jsonb_build_object('options', jsonb_build_object('A', 'Bắt đầu ngay mà chưa xác định mục tiêu', 'B', 'Thử ngẫu nhiên nhiều cách và không lưu kết quả', 'C', 'Chuẩn bị nguồn lực, thực hiện có kiểm soát và rà soát đầu ra', 'D', 'Chỉ dựa vào một ví dụ mà không đối chiếu'), 'correct', 'C')
        ELSE jsonb_build_object('options', jsonb_build_object('A', 'Giữ nguyên kết quả dù không đáp ứng yêu cầu', 'B', 'Chỉ hỏi người khác mà không tự kiểm tra', 'C', 'Bỏ qua dữ liệu đầu vào và chuyển sang việc khác', 'D', 'Xác định nguyên nhân, kiểm tra từng bước và điều chỉnh có căn cứ'), 'correct', 'D')
    END,
    q.created_at + (n.question_no || ' minutes')::INTERVAL
FROM seed_quiz_plan q
CROSS JOIN LATERAL generate_series(1, q.question_count) AS n(question_no);

WITH inserted_questions AS (
    INSERT INTO questions (
        course_id, original_question_id, content, level, explanation, answer,
        version_number, status, created_at, updated_at
    )
    SELECT course_id, NULL, content, level, explanation, answer, 1, 1, created_at, created_at + INTERVAL '1 minute'
    FROM seed_question_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'questions', i.id::TEXT
FROM inserted_questions i CROSS JOIN seed_context c;

WITH inserted_quizzes AS (
    INSERT INTO quizzes (
        module_id, original_quiz_id, title, max_attempts, passing_score,
        version_number, status, created_at
    )
    SELECT module_id, NULL, quiz_title, max_attempts, passing_score, 1, 1, created_at
    FROM seed_quiz_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'quizzes', i.id::TEXT
FROM inserted_quizzes i CROSS JOIN seed_context c;

WITH inserted_quiz_questions AS (
    INSERT INTO quiz_questions (
        quiz_id, question_id, sort_order, created_at, updated_at, deleted_at
    )
    SELECT
        quiz.id, question.id, p.question_no, p.created_at, p.created_at + INTERVAL '1 minute', NULL
    FROM seed_question_plan p
    JOIN quizzes quiz ON quiz.module_id = p.module_id
    JOIN questions question ON question.course_id = p.course_id AND question.content = p.content
    WHERE quiz.title = (SELECT quiz_title FROM seed_quiz_plan WHERE module_id = p.module_id)
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'quiz_questions', i.id::TEXT
FROM inserted_quiz_questions i CROSS JOIN seed_context c;

DO $$
DECLARE
    v_courses INT;
    v_modules INT;
    v_lessons INT;
    v_questions INT;
    v_quizzes INT;
    v_quiz_questions INT;
BEGIN
    SELECT count(*) INTO v_courses FROM seed_course_plan;
    SELECT count(*) INTO v_modules FROM seed_modules;
    SELECT count(*) INTO v_lessons FROM seed_lesson_plan;
    SELECT count(*) INTO v_questions FROM seed_question_plan;
    SELECT count(*) INTO v_quizzes FROM seed_quiz_plan;
    SELECT count(*) INTO v_quiz_questions
    FROM quiz_questions qq
    JOIN quizzes q ON q.id = qq.quiz_id
    JOIN seed_quiz_plan p ON p.module_id = q.module_id;

    IF v_courses <> 500 OR v_modules < 2500 OR v_lessons < 12500 OR v_questions <> v_quiz_questions THEN
        RAISE EXCEPTION 'Course seed verification failed: courses %, modules %, lessons %, questions %, quiz questions %.',
            v_courses, v_modules, v_lessons, v_questions, v_quiz_questions;
    END IF;

    UPDATE seed_runs
    SET status = 'COMPLETED', completed_at = NOW(),
        metadata = metadata || jsonb_build_object(
            'courses', v_courses, 'modules', v_modules, 'lessons', v_lessons,
            'questions', v_questions, 'quizzes', v_quizzes, 'quiz_questions', v_quiz_questions
        )
    WHERE id = (SELECT run_id FROM seed_context);
END $$;

SELECT
    (SELECT count(*) FROM seed_course_plan) AS courses,
    (SELECT count(*) FROM seed_modules) AS modules,
    (SELECT count(*) FROM seed_lesson_plan) AS lessons,
    (SELECT count(*) FROM seed_question_plan) AS questions,
    (SELECT count(*) FROM seed_quiz_plan) AS quizzes;

COMMIT;

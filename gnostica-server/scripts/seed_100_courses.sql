-- Seed 100 complete test courses with modules, lessons, questions and quizzes.
-- Run manually against PostgreSQL. This is intentionally not a Flyway migration.
-- Re-running updates the 100 courses and rebuilds their child curriculum data.

DO $$
DECLARE
    thumbnail_url CONSTANT TEXT := 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784171548/gnostica_forum/ai%20agents%201_25b46548-5396-41ca-824d-679ac115a407.jpg';
    video_ref CONSTANT TEXT := '635422/f2b4d8a5-e075-441d-bd31-e69b3419229b';
    seed_group CONSTANT TEXT := 'gnostica_100_courses';

    instructor_ids UUID[];
    category_ids INT[];
    category_names TEXT[];
    topic_templates TEXT[] := ARRAY[
        'nền tảng cho người mới bắt đầu',
        'lộ trình thực chiến từ cơ bản đến nâng cao',
        'xây dựng dự án ứng dụng trong công việc',
        'tăng tốc kỹ năng qua bài tập tình huống',
        'chuyên sâu với quy trình chuyên nghiệp',
        'thực hành theo case study doanh nghiệp',
        'ứng dụng AI để nâng cao hiệu suất',
        'tư duy hệ thống và tối ưu quy trình',
        'kỹ năng thiết yếu cho người đi làm',
        'bootcamp hoàn chỉnh trong 30 ngày',
        'phân tích lỗi thường gặp và cách khắc phục',
        'xây dựng portfolio cá nhân nổi bật',
        'nâng cấp năng lực làm việc nhóm',
        'tự động hóa tác vụ hằng ngày',
        'chuẩn hóa quy trình từ ý tưởng đến sản phẩm',
        'thực hành chuyên sâu qua mini project',
        'kỹ thuật ra quyết định dựa trên dữ liệu',
        'làm chủ công cụ và phương pháp hiện đại',
        'lộ trình ôn tập và đánh giá năng lực',
        'tư duy chiến lược cho dự án thực tế'
    ];
    level_values TEXT[] := ARRAY['Beginner', 'Intermediate', 'Advanced'];
    discount_values INT[] := ARRAY[0, 10, 15, 20, 25, 30, 40, 50];
    status_label TEXT;
    reject_reason TEXT;

    i INT;
    m INT;
    l INT;
    q INT;
    qq INT;
    course_id UUID;
    module_id INT;
    v_quiz_id INT;
    question_ids INT[];
    course_status INT;
    module_status INT;
    lesson_status INT;
    module_count INT;
    lesson_count INT;
    category_index INT;
    instructor_index INT;
    course_title TEXT;
    course_slug TEXT;
    course_description TEXT;
    course_price NUMERIC(18,6);
    course_discount INT;
    course_level TEXT;
    course_metadata JSONB;
BEGIN
    SELECT ARRAY_AGG(a.id ORDER BY a.email)
    INTO instructor_ids
    FROM accounts a
    JOIN roles r ON r.id = a.role_id
    WHERE LOWER(r.name) = 'instructor'
      AND a.status = 1
      AND a.deleted_at IS NULL;

    IF COALESCE(ARRAY_LENGTH(instructor_ids, 1), 0) < 4 THEN
        RAISE EXCEPTION 'Cannot seed courses: expected at least 4 active instructors, found %',
            COALESCE(ARRAY_LENGTH(instructor_ids, 1), 0);
    END IF;

    SELECT ARRAY_AGG(c.id ORDER BY c.parent_id NULLS LAST, c.sort_order, c.id),
           ARRAY_AGG(c.name ORDER BY c.parent_id NULLS LAST, c.sort_order, c.id)
    INTO category_ids, category_names
    FROM categories c
    WHERE c.status = 1
      AND c.deleted_at IS NULL
      AND c.parent_id IS NOT NULL;

    IF COALESCE(ARRAY_LENGTH(category_ids, 1), 0) = 0 THEN
        SELECT ARRAY_AGG(c.id ORDER BY c.sort_order, c.id),
               ARRAY_AGG(c.name ORDER BY c.sort_order, c.id)
        INTO category_ids, category_names
        FROM categories c
        WHERE c.status = 1
          AND c.deleted_at IS NULL;
    END IF;

    IF COALESCE(ARRAY_LENGTH(category_ids, 1), 0) = 0 THEN
        RAISE EXCEPTION 'Cannot seed courses: no active category exists';
    END IF;

    WITH seed_courses AS (
        SELECT id
        FROM courses
        WHERE slug LIKE 'gnostica-khoa-hoc-%'
           OR metadata ->> 'seed_group' = seed_group
    ),
    seed_modules AS (
        SELECT mo.id
        FROM modules mo
        WHERE mo.course_id IN (SELECT sc.id FROM seed_courses sc)
    ),
    seed_quizzes AS (
        SELECT qz.id
        FROM quizzes qz
        WHERE qz.module_id IN (SELECT sm.id FROM seed_modules sm)
    ),
    seed_questions AS (
        SELECT qu.id
        FROM questions qu
        WHERE qu.course_id IN (SELECT sc.id FROM seed_courses sc)
    )
    DELETE FROM quiz_questions qqd
    WHERE qqd.quiz_id IN (SELECT sq.id FROM seed_quizzes sq)
       OR qqd.question_id IN (SELECT qu.id FROM seed_questions qu);

    DELETE FROM quizzes qz
    WHERE qz.module_id IN (
        SELECT m.id
        FROM modules m
        JOIN courses c ON c.id = m.course_id
        WHERE c.slug LIKE 'gnostica-khoa-hoc-%'
           OR c.metadata ->> 'seed_group' = seed_group
    );

    DELETE FROM questions qu
    WHERE qu.course_id IN (
        SELECT c.id
        FROM courses c
        WHERE c.slug LIKE 'gnostica-khoa-hoc-%'
           OR c.metadata ->> 'seed_group' = seed_group
    );

    DELETE FROM lessons le
    WHERE le.module_id IN (
        SELECT m.id
        FROM modules m
        JOIN courses c ON c.id = m.course_id
        WHERE c.slug LIKE 'gnostica-khoa-hoc-%'
           OR c.metadata ->> 'seed_group' = seed_group
    );

    DELETE FROM attachments att
    WHERE att.module_id IN (
        SELECT m.id
        FROM modules m
        JOIN courses c ON c.id = m.course_id
        WHERE c.slug LIKE 'gnostica-khoa-hoc-%'
           OR c.metadata ->> 'seed_group' = seed_group
    );

    DELETE FROM modules mo
    WHERE mo.course_id IN (
        SELECT c.id
        FROM courses c
        WHERE c.slug LIKE 'gnostica-khoa-hoc-%'
           OR c.metadata ->> 'seed_group' = seed_group
    );

    FOR i IN 1..100 LOOP
        course_id := (
            SUBSTR(MD5('gnostica-seed-course-' || i), 1, 8) || '-' ||
            SUBSTR(MD5('gnostica-seed-course-' || i), 9, 4) || '-' ||
            SUBSTR(MD5('gnostica-seed-course-' || i), 13, 4) || '-' ||
            SUBSTR(MD5('gnostica-seed-course-' || i), 17, 4) || '-' ||
            SUBSTR(MD5('gnostica-seed-course-' || i), 21, 12)
        )::UUID;

        instructor_index := ((i - 1) % ARRAY_LENGTH(instructor_ids, 1)) + 1;
        category_index := ((i - 1) % ARRAY_LENGTH(category_ids, 1)) + 1;
        course_status := CASE
            WHEN i <= 60 THEN 1
            WHEN i <= 75 THEN 2
            WHEN i <= 90 THEN 4
            ELSE 3
        END;
        status_label := CASE course_status
            WHEN 1 THEN 'Đã duyệt'
            WHEN 2 THEN 'Tạm ẩn'
            WHEN 3 THEN 'Bị từ chối'
            WHEN 4 THEN 'Chờ duyệt'
            ELSE 'Khác'
        END;
        reject_reason := CASE WHEN course_status = 3 THEN
            'Dữ liệu kiểm thử: khóa học cần bổ sung mô tả chi tiết, tài liệu tham khảo hoặc chuẩn hóa nội dung bài học.'
        ELSE NULL END;

        course_slug := 'gnostica-khoa-hoc-' || LPAD(i::TEXT, 3, '0');
        course_title := category_names[category_index] || ': ' ||
            topic_templates[((i - 1) % ARRAY_LENGTH(topic_templates, 1)) + 1];
        course_description := 'Khóa học kiểm thử thuộc danh mục ' || category_names[category_index] ||
            ', được thiết kế để kiểm tra luồng hiển thị, tìm kiếm, phân trang, kiểm duyệt và học tập. ' ||
            'Nội dung bao gồm mục tiêu học tập, chương bài, video, câu hỏi ôn tập và quiz theo từng chương.';
        course_price := CASE
            WHEN i % 10 = 0 THEN 0
            ELSE (199000 + ((i % 8) * 120000) + ((i % 5) * 50000))::NUMERIC(18,6)
        END;
        course_discount := discount_values[((i - 1) % ARRAY_LENGTH(discount_values, 1)) + 1];
        course_level := level_values[((i - 1) % ARRAY_LENGTH(level_values, 1)) + 1];
        course_metadata := JSONB_BUILD_OBJECT(
            'seed_group', seed_group,
            'seed_index', i,
            'status_label', status_label,
            'estimated_hours', 6 + (i % 18),
            'language', 'vi',
            'learning_outcomes', JSONB_BUILD_ARRAY(
                'Nắm được nền tảng và thuật ngữ cốt lõi.',
                'Thực hành qua bài học video và tình huống mẫu.',
                'Hoàn thành quiz để tự đánh giá năng lực.'
            )
        );

        IF reject_reason IS NOT NULL THEN
            course_metadata := course_metadata || JSONB_BUILD_OBJECT(
                'moderation', JSONB_BUILD_OBJECT('reject_reason', reject_reason)
            );
        END IF;

        INSERT INTO courses (
            id, account_id, category_id, original_course_id, title, slug, description, thumbnail,
            price, discount, level, promo_video, shared_count, version_number, status, metadata,
            created_at, updated_at, published_at, deleted_at
        )
        VALUES (
            course_id, instructor_ids[instructor_index], category_ids[category_index], NULL,
            course_title, course_slug, course_description, thumbnail_url,
            course_price, course_discount, course_level, video_ref, (i % 25), 1, course_status, course_metadata,
            NOW() - ((100 - i) || ' days')::INTERVAL,
            NOW() - ((100 - i) || ' days')::INTERVAL,
            CASE WHEN course_status = 1 THEN NOW() - ((95 - i) || ' days')::INTERVAL ELSE NULL END,
            NULL
        )
        ON CONFLICT (slug) DO UPDATE SET
            id = EXCLUDED.id,
            account_id = EXCLUDED.account_id,
            category_id = EXCLUDED.category_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            thumbnail = EXCLUDED.thumbnail,
            price = EXCLUDED.price,
            discount = EXCLUDED.discount,
            level = EXCLUDED.level,
            promo_video = EXCLUDED.promo_video,
            shared_count = EXCLUDED.shared_count,
            version_number = EXCLUDED.version_number,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = NOW(),
            published_at = EXCLUDED.published_at,
            deleted_at = NULL;

        question_ids := ARRAY[]::INT[];
        FOR q IN 1..8 LOOP
            INSERT INTO questions (
                course_id, original_question_id, content, level, explanation, answer,
                version_number, status, created_at, updated_at
            )
            VALUES (
                course_id,
                NULL,
                'Câu hỏi ' || q || ' cho khóa "' || course_title || '": lựa chọn nào phản ánh đúng nội dung trọng tâm?',
                CASE WHEN q <= 3 THEN 'easy' WHEN q <= 6 THEN 'medium' ELSE 'hard' END,
                'Đáp án đúng giúp người học củng cố mục tiêu chính của chương và liên hệ với tình huống thực tế.',
                JSONB_BUILD_OBJECT(
                    'options', JSONB_BUILD_OBJECT(
                        'A', 'Áp dụng kiến thức vào bài tập thực hành.',
                        'B', 'Bỏ qua phần ví dụ và chỉ xem kết quả.',
                        'C', 'Không cần ôn tập sau mỗi chương.',
                        'D', 'Chỉ học lý thuyết mà không thực hành.'
                    ),
                    'correct', 'A'
                ),
                1,
                1,
                NOW(),
                NOW()
            )
            RETURNING id INTO qq;
            question_ids := ARRAY_APPEND(question_ids, qq);
        END LOOP;

        module_count := 3 + (i % 3);
        FOR m IN 1..module_count LOOP
            module_status := CASE
                WHEN course_status = 2 THEN 2
                WHEN course_status = 1 AND m = module_count AND i % 5 = 0 THEN 2
                ELSE 1
            END;

            INSERT INTO modules (
                course_id, original_module_id, title, metadata, version_number, sort_order,
                status, created_at, updated_at, deleted_at
            )
            VALUES (
                course_id,
                NULL,
                'Chương ' || m || ': ' || CASE m
                    WHEN 1 THEN 'Khởi động và định hướng'
                    WHEN 2 THEN 'Nền tảng cốt lõi'
                    WHEN 3 THEN 'Thực hành có hướng dẫn'
                    WHEN 4 THEN 'Dự án ứng dụng'
                    ELSE 'Tổng kết và mở rộng'
                END,
                JSONB_BUILD_OBJECT(
                    'seed_group', seed_group,
                    'objective', 'Hoàn thành các bài học và quiz của chương ' || m,
                    'estimated_minutes', 45 + (m * 15)
                ),
                1,
                m,
                module_status,
                NOW(),
                NOW(),
                NULL
            )
            RETURNING id INTO module_id;

            lesson_count := 4 + ((i + m) % 3);
            FOR l IN 1..lesson_count LOOP
                lesson_status := CASE
                    WHEN module_status = 2 THEN 2
                    WHEN l = lesson_count AND (i + m) % 7 = 0 THEN 2
                    ELSE 1
                END;

                INSERT INTO lessons (
                    module_id, original_lesson_id, title, content, video_url, metadata,
                    version_number, sort_order, status, created_at, updated_at, deleted_at
                )
                VALUES (
                    module_id,
                    NULL,
                    'Bài ' || l || ': ' || CASE l
                        WHEN 1 THEN 'Mục tiêu và bối cảnh'
                        WHEN 2 THEN 'Khái niệm chính'
                        WHEN 3 THEN 'Ví dụ minh họa'
                        WHEN 4 THEN 'Bài tập thực hành'
                        WHEN 5 THEN 'Lỗi thường gặp'
                        ELSE 'Tổng kết bài học'
                    END,
                    'Nội dung kiểm thử cho bài học thuộc khóa "' || course_title ||
                    '". Bài học cung cấp phần giới thiệu, hướng dẫn từng bước, ví dụ thực tế và nhiệm vụ tự luyện.',
                    video_ref,
                    JSONB_BUILD_OBJECT(
                        'durationSeconds', 420 + (l * 90) + (m * 30),
                        'transcript', 'Transcript mẫu cho bài ' || l || ', chương ' || m || '.',
                        'seed_group', seed_group
                    ),
                    1,
                    l,
                    lesson_status,
                    NOW(),
                    NOW(),
                    NULL
                );
            END LOOP;

            INSERT INTO quizzes (
                module_id, original_quiz_id, title, max_attempts, passing_score,
                version_number, status, created_at
            )
            VALUES (
                module_id,
                NULL,
                'Quiz chương ' || m || ' - ' || category_names[category_index],
                3,
                5.00,
                1,
                module_status,
                NOW()
            )
            RETURNING id INTO v_quiz_id;

            FOR qq IN 1..4 LOOP
                INSERT INTO quiz_questions (
                    quiz_id, question_id, sort_order, created_at, updated_at, deleted_at
                )
                VALUES (
                    v_quiz_id,
                    question_ids[((m + qq - 2) % ARRAY_LENGTH(question_ids, 1)) + 1],
                    qq,
                    NOW(),
                    NOW(),
                    NULL
                )
                ON CONFLICT (quiz_id, question_id) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

SELECT status, COUNT(*) AS courses
FROM courses
WHERE metadata ->> 'seed_group' = 'gnostica_100_courses'
GROUP BY status
ORDER BY status;

SELECT
    COUNT(*) AS courses,
    (SELECT COUNT(*) FROM modules m JOIN courses c ON c.id = m.course_id WHERE c.metadata ->> 'seed_group' = 'gnostica_100_courses') AS modules,
    (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id WHERE c.metadata ->> 'seed_group' = 'gnostica_100_courses') AS lessons,
    (SELECT COUNT(*) FROM questions q JOIN courses c ON c.id = q.course_id WHERE c.metadata ->> 'seed_group' = 'gnostica_100_courses') AS questions,
    (SELECT COUNT(*) FROM quizzes qz JOIN modules m ON m.id = qz.module_id JOIN courses c ON c.id = m.course_id WHERE c.metadata ->> 'seed_group' = 'gnostica_100_courses') AS quizzes
FROM courses
WHERE metadata ->> 'seed_group' = 'gnostica_100_courses';

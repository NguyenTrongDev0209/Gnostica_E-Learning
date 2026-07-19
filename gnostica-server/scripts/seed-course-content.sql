-- Idempotent development seed: 3 modules and 12 lessons for every seeded course.
-- Courses that already contain at least one non-deleted module are left untouched.

DO $$
DECLARE
    course_record RECORD;
    module_id INTEGER;
    module_index INTEGER;
    lesson_index INTEGER;
    module_title TEXT;
    lesson_title TEXT;
    lesson_content TEXT;
    video_url TEXT := '655066/c63829f9-ad28-4567-a474-9988814a8899';
BEGIN
    FOR course_record IN
        SELECT c.id, c.title, c.status, cat.name AS category_name
        FROM courses c
        JOIN categories cat ON cat.id = c.category_id
        WHERE c.id = md5(c.slug)::uuid
          AND c.promo_video = video_url
          AND c.deleted_at IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM modules existing_module
              WHERE existing_module.course_id = c.id
                AND existing_module.deleted_at IS NULL
          )
        ORDER BY c.slug
    LOOP
        FOR module_index IN 1..3 LOOP
            module_title := CASE module_index
                WHEN 1 THEN 'Chương 1: Nền tảng ' || course_record.title
                WHEN 2 THEN 'Chương 2: Thực hành chuyên sâu'
                ELSE 'Chương 3: Dự án cuối khóa'
            END;

            INSERT INTO modules (
                course_id, original_module_id, title, version_number,
                sort_order, status, created_at, updated_at
            ) VALUES (
                course_record.id, NULL, module_title, 1,
                module_index, course_record.status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING id INTO module_id;

            FOR lesson_index IN 1..4 LOOP
                lesson_title := CASE
                    WHEN module_index = 1 AND lesson_index = 1 THEN 'Giới thiệu khóa học và lộ trình học tập'
                    WHEN module_index = 1 AND lesson_index = 2 THEN 'Các khái niệm cốt lõi cần nắm vững'
                    WHEN module_index = 1 AND lesson_index = 3 THEN 'Chuẩn bị công cụ và môi trường thực hành'
                    WHEN module_index = 1 AND lesson_index = 4 THEN 'Bài thực hành khởi động'
                    WHEN module_index = 2 AND lesson_index = 1 THEN 'Quy trình thực hiện từng bước'
                    WHEN module_index = 2 AND lesson_index = 2 THEN 'Kỹ thuật và phương pháp nâng cao'
                    WHEN module_index = 2 AND lesson_index = 3 THEN 'Xử lý các tình huống thường gặp'
                    WHEN module_index = 2 AND lesson_index = 4 THEN 'Bài tập thực hành chuyên sâu'
                    WHEN module_index = 3 AND lesson_index = 1 THEN 'Phân tích yêu cầu dự án cuối khóa'
                    WHEN module_index = 3 AND lesson_index = 2 THEN 'Xây dựng sản phẩm theo từng giai đoạn'
                    WHEN module_index = 3 AND lesson_index = 3 THEN 'Kiểm thử, đánh giá và hoàn thiện'
                    ELSE 'Tổng kết khóa học và định hướng phát triển'
                END;

                lesson_content := CASE module_index
                    WHEN 1 THEN format(
                        '<h2>%s</h2><p>Bài học cung cấp kiến thức nền tảng của khóa <strong>%s</strong> thuộc lĩnh vực %s.</p><p>Sau bài học, bạn có thể nhận biết các khái niệm chính và áp dụng chúng vào bài thực hành cơ bản.</p>',
                        lesson_title, course_record.title, course_record.category_name
                    )
                    WHEN 2 THEN format(
                        '<h2>%s</h2><p>Trong bài học này, bạn sẽ thực hành các kỹ năng quan trọng của khóa <strong>%s</strong> qua một tình huống gần với công việc thực tế.</p><p>Hãy hoàn thành từng bước trong video và tự kiểm tra kết quả trước khi chuyển sang bài tiếp theo.</p>',
                        lesson_title, course_record.title
                    )
                    ELSE format(
                        '<h2>%s</h2><p>Bài học hướng dẫn bạn vận dụng kiến thức từ khóa <strong>%s</strong> để hoàn thiện dự án cuối khóa.</p><p>Sản phẩm cần đáp ứng yêu cầu, có khả năng trình bày rõ ràng và thể hiện được kỹ năng đã học.</p>',
                        lesson_title, course_record.title
                    )
                END;

                INSERT INTO lessons (
                    module_id, original_lesson_id, title, content, video_url,
                    version_number, sort_order, status, created_at, updated_at
                ) VALUES (
                    module_id, NULL, lesson_title, lesson_content, video_url,
                    1, lesson_index, course_record.status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

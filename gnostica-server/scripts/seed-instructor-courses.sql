-- Idempotent development seed: six public courses for each target instructor.

DO $$
DECLARE
    first_instructor UUID := '795919db-37b9-4cbf-a901-5a2448bce911';
    second_instructor UUID := '5982c873-cc42-47c4-8588-a64905f83fb4';
    third_instructor UUID := 'bae60821-fb6c-4db0-8924-af768fb06872';
    thumbnail_url TEXT := 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg';
    video_url TEXT := '655066/c63829f9-ad28-4567-a474-9988814a8899';
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM accounts WHERE id = first_instructor AND status = 1 AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Active instructor account % was not found', first_instructor;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM accounts WHERE id = second_instructor AND status = 1 AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Active instructor account % was not found', second_instructor;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM accounts WHERE id = third_instructor AND status = 1 AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Active instructor account % was not found', third_instructor;
    END IF;

    INSERT INTO courses (
        id, account_id, category_id, original_course_id, title, slug, description,
        thumbnail, price, discount, level, promo_video, shared_count,
        version_number, status, created_at, updated_at, published_at
    )
    SELECT
        md5(seed.slug)::uuid,
        seed.instructor_id,
        category.id,
        NULL,
        seed.title,
        seed.slug,
        seed.description,
        thumbnail_url,
        seed.price,
        seed.discount,
        seed.level,
        video_url,
        seed.shared_count,
        1,
        1,
        CURRENT_TIMESTAMP - (seed.age_days || ' days')::interval,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - (seed.age_days || ' days')::interval
    FROM (VALUES
        (first_instructor, 'lap-trinh-web', 'Node.js và Express: REST API chuẩn sản phẩm', 'nodejs-express-rest-api-minh-le', 'Xây dựng REST API có xác thực, phân quyền, kiểm thử và tài liệu hóa.', 999000::numeric, 30, 'Intermediate', 36, 12),
        (first_instructor, 'lap-trinh-web', 'Next.js Fullstack với App Router', 'nextjs-fullstack-app-router-minh-le', 'Phát triển ứng dụng fullstack hiện đại với Next.js, database và server actions.', 1399000::numeric, 35, 'Advanced', 48, 11),
        (first_instructor, 'phat-trien-mobile', 'Expo React Native: Ra mắt ứng dụng đầu tiên', 'expo-react-native-ra-mat-ung-dung-minh-le', 'Tạo, kiểm thử và phát hành ứng dụng đa nền tảng bằng Expo.', 899000::numeric, 25, 'Beginner', 27, 10),
        (first_instructor, 'tri-tue-nhan-tao', 'Ứng dụng AI vào quy trình lập trình', 'ung-dung-ai-quy-trinh-lap-trinh-minh-le', 'Dùng trợ lý AI để phân tích yêu cầu, viết mã, kiểm thử và rà soát chất lượng.', 749000::numeric, 20, 'Intermediate', 55, 9),
        (first_instructor, 'cong-nghe-thong-tin', 'Docker và CI/CD cho dự án Web', 'docker-ci-cd-du-an-web-minh-le', 'Đóng gói ứng dụng và tự động hóa quy trình kiểm thử, triển khai.', 1199000::numeric, 30, 'Advanced', 42, 8),
        (first_instructor, 'thiet-ke-ui-ux', 'Từ Figma đến giao diện React chính xác', 'figma-den-react-chinh-xac-minh-le', 'Chuyển thiết kế Figma thành component React responsive và nhất quán.', 849000::numeric, 15, 'Intermediate', 31, 7),

        (second_instructor, 'khoa-hoc-du-lieu', 'Excel và Power Query cho phân tích nhanh', 'excel-power-query-minh-quoc', 'Làm sạch, kết hợp và phân tích dữ liệu doanh nghiệp không cần viết mã.', 599000::numeric, 20, 'Beginner', 29, 6),
        (second_instructor, 'khoa-hoc-du-lieu', 'Python trực quan hóa dữ liệu với Plotly', 'python-plotly-minh-quoc', 'Biến dữ liệu thành biểu đồ tương tác và dashboard dễ hiểu.', 849000::numeric, 25, 'Intermediate', 34, 5),
        (second_instructor, 'tri-tue-nhan-tao', 'Machine Learning cho bài toán Marketing', 'machine-learning-marketing-minh-quoc', 'Phân khúc khách hàng, dự đoán chuyển đổi và đo lường chiến dịch bằng ML.', 1299000::numeric, 35, 'Advanced', 61, 4),
        (second_instructor, 'kinh-doanh-va-marketing', 'Google Ads từ thiết lập đến tối ưu ROI', 'google-ads-toi-uu-roi-minh-quoc', 'Xây dựng chiến dịch tìm kiếm và tối ưu hiệu quả theo dữ liệu thực tế.', 999000::numeric, 30, 'Intermediate', 46, 3),
        (second_instructor, 'kinh-doanh-va-marketing', 'Xây dựng thương hiệu cá nhân trên LinkedIn', 'thuong-hieu-ca-nhan-linkedin-minh-quoc', 'Định vị chuyên môn, lập kế hoạch nội dung và phát triển mạng lưới chất lượng.', 549000::numeric, 15, 'Beginner', 38, 2),
        (second_instructor, 'ngoai-ngu', 'Tiếng Anh phỏng vấn ngành Công nghệ', 'tieng-anh-phong-van-cong-nghe-minh-quoc', 'Chuẩn bị CV, trả lời câu hỏi và mô phỏng phỏng vấn bằng tiếng Anh.', 699000::numeric, 20, 'Intermediate', 43, 1),

        (third_instructor, 'lap-trinh-web', 'Vue.js 3 và Pinia qua dự án thực tế', 'vuejs-3-pinia-dragon-minh-le', 'Xây dựng ứng dụng Vue hiện đại với Composition API, Pinia và REST API.', 949000::numeric, 25, 'Intermediate', 33, 12),
        (third_instructor, 'phat-trien-mobile', 'iOS SwiftUI: Thiết kế ứng dụng đầu tiên', 'ios-swiftui-dragon-minh-le', 'Làm quen Swift, SwiftUI và phát triển ứng dụng iOS có dữ liệu động.', 1199000::numeric, 30, 'Beginner', 28, 10),
        (third_instructor, 'tri-tue-nhan-tao', 'Tự động hóa công việc với AI Agent', 'tu-dong-hoa-ai-agent-dragon-minh-le', 'Thiết kế quy trình AI agent có công cụ, bộ nhớ và khả năng xử lý tác vụ.', 1499000::numeric, 35, 'Advanced', 57, 8),
        (third_instructor, 'thiet-ke-ui-ux', 'UI Animation và Micro-interaction cho Web', 'ui-animation-micro-interaction-dragon-minh-le', 'Tạo chuyển động giao diện tinh tế giúp sản phẩm trực quan và hấp dẫn hơn.', 899000::numeric, 20, 'Intermediate', 41, 6),
        (third_instructor, 'kinh-doanh-va-marketing', 'Content Marketing đa kênh từ A đến Z', 'content-marketing-da-kenh-dragon-minh-le', 'Lập chiến lược và sản xuất nội dung nhất quán cho website và mạng xã hội.', 749000::numeric, 15, 'Beginner', 39, 4),
        (third_instructor, 'ngoai-ngu', 'Tiếng Anh cho lập trình viên và đội ngũ IT', 'tieng-anh-lap-trinh-vien-dragon-minh-le', 'Luyện đọc tài liệu, trao đổi kỹ thuật và giao tiếp trong nhóm quốc tế.', 799000::numeric, 25, 'Intermediate', 45, 2)
    ) AS seed(instructor_id, category_slug, title, slug, description, price, discount, level, shared_count, age_days)
    JOIN categories category ON category.slug = seed.category_slug
    ON CONFLICT (slug) DO NOTHING;

    UPDATE courses
    SET status = 1,
        published_at = COALESCE(published_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE account_id IN (first_instructor, second_instructor, third_instructor)
      AND promo_video = video_url
      AND id = md5(slug)::uuid;
END $$;

-- Idempotent development seed: 10 categories and 40 published courses.
-- The owner email can be overridden with:
-- SET gnostica.seed_instructor_email = 'instructor@example.com';

DO $$
DECLARE
    owner_id UUID;
    owner_email TEXT := COALESCE(
        NULLIF(current_setting('gnostica.seed_instructor_email', true), ''),
        'goslink.team@gmail.com'
    );
BEGIN
    SELECT id INTO owner_id
    FROM accounts
    WHERE email = owner_email AND deleted_at IS NULL
    LIMIT 1;

    IF owner_id IS NULL THEN
        RAISE EXCEPTION 'Cannot seed catalog: instructor account % was not found', owner_email;
    END IF;

    INSERT INTO categories (
        account_id, parent_id, name, slug, description, thumbnail, color,
        sort_order, status, created_at, updated_at
    ) VALUES
        (owner_id, NULL, 'Công nghệ thông tin', 'cong-nghe-thong-tin', 'Khám phá các kỹ năng công nghệ phục vụ công việc hiện đại.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#4F46E5', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, NULL, 'Dữ liệu và AI', 'du-lieu-va-ai', 'Học cách khai thác dữ liệu và xây dựng giải pháp trí tuệ nhân tạo.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#7C3AED', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, NULL, 'Thiết kế sáng tạo', 'thiet-ke-sang-tao', 'Phát triển tư duy thẩm mỹ và kỹ năng thiết kế sản phẩm số.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#EC4899', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, NULL, 'Kinh doanh và Marketing', 'kinh-doanh-va-marketing', 'Kiến thức thực tiễn về kinh doanh, thương hiệu và tiếp thị.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#F97316', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, NULL, 'Ngoại ngữ', 'ngoai-ngu', 'Nâng cao năng lực giao tiếp ngoại ngữ trong học tập và công việc.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#0EA5E9', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO categories (
        account_id, parent_id, name, slug, description, thumbnail, color,
        sort_order, status, created_at, updated_at
    ) VALUES
        (owner_id, (SELECT id FROM categories WHERE slug = 'cong-nghe-thong-tin'), 'Lập trình Web', 'lap-trinh-web', 'Xây dựng website từ giao diện đến hệ thống phía máy chủ.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#2563EB', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, (SELECT id FROM categories WHERE slug = 'cong-nghe-thong-tin'), 'Phát triển Mobile', 'phat-trien-mobile', 'Phát triển ứng dụng di động đa nền tảng và native.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#06B6D4', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, (SELECT id FROM categories WHERE slug = 'du-lieu-va-ai'), 'Khoa học dữ liệu', 'khoa-hoc-du-lieu', 'Phân tích, trực quan hóa và khai phá giá trị từ dữ liệu.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#8B5CF6', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, (SELECT id FROM categories WHERE slug = 'du-lieu-va-ai'), 'Trí tuệ nhân tạo', 'tri-tue-nhan-tao', 'Ứng dụng machine learning và AI tạo sinh vào sản phẩm.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#A855F7', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (owner_id, (SELECT id FROM categories WHERE slug = 'thiet-ke-sang-tao'), 'Thiết kế UI/UX', 'thiet-ke-ui-ux', 'Thiết kế trải nghiệm và giao diện sản phẩm thân thiện với người dùng.', 'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg', '#DB2777', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO courses (
        id, account_id, category_id, original_course_id, title, slug, description,
        thumbnail, price, discount, level, promo_video, shared_count,
        version_number, status, created_at, updated_at, published_at
    )
    SELECT
        md5(seed.slug)::uuid,
        owner_id,
        category.id,
        NULL,
        seed.title,
        seed.slug,
        seed.description,
        'https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg',
        seed.price,
        seed.discount,
        seed.level,
        '655066/c63829f9-ad28-4567-a474-9988814a8899',
        seed.shared_count,
        1,
        1,
        CURRENT_TIMESTAMP - (seed.age_days || ' days')::interval,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - (seed.age_days || ' days')::interval
    FROM (VALUES
        ('cong-nghe-thong-tin', 'Nhập môn Công nghệ thông tin cho người mới', 'nhap-mon-cong-nghe-thong-tin', 'Làm quen với máy tính, hệ điều hành, mạng và tư duy giải quyết vấn đề trong ngành công nghệ.', 399000::numeric, 20, 'Beginner', 12, 40),
        ('cong-nghe-thong-tin', 'Git và GitHub: Làm việc nhóm chuyên nghiệp', 'git-github-lam-viec-nhom-chuyen-nghiep', 'Quản lý phiên bản, xử lý nhánh và phối hợp hiệu quả trong dự án phần mềm.', 499000::numeric, 15, 'Beginner', 18, 39),
        ('cong-nghe-thong-tin', 'Linux thực chiến cho lập trình viên', 'linux-thuc-chien-cho-lap-trinh-vien', 'Sử dụng dòng lệnh, quyền truy cập, tiến trình và triển khai dịch vụ trên Linux.', 649000::numeric, 25, 'Intermediate', 25, 38),
        ('cong-nghe-thong-tin', 'An toàn thông tin và bảo mật ứng dụng', 'an-toan-thong-tin-bao-mat-ung-dung', 'Nhận diện lỗ hổng phổ biến và xây dựng thói quen phát triển phần mềm an toàn.', 899000::numeric, 30, 'Advanced', 31, 37),

        ('lap-trinh-web', 'HTML CSS từ số 0: Xây dựng website đầu tiên', 'html-css-tu-so-0', 'Học nền tảng giao diện web qua các bài tập và một dự án hoàn chỉnh.', 449000::numeric, 10, 'Beginner', 34, 36),
        ('lap-trinh-web', 'JavaScript hiện đại qua 20 dự án nhỏ', 'javascript-hien-dai-20-du-an', 'Nắm vững JavaScript ES6+, DOM, bất đồng bộ và tư duy lập trình thực tế.', 799000::numeric, 35, 'Intermediate', 47, 35),
        ('lap-trinh-web', 'React và TypeScript chuyên sâu', 'react-typescript-chuyen-sau', 'Xây dựng ứng dụng React có cấu trúc tốt, an toàn kiểu dữ liệu và dễ bảo trì.', 1199000::numeric, 40, 'Advanced', 63, 34),
        ('lap-trinh-web', 'Fullstack Spring Boot và React', 'fullstack-spring-boot-react', 'Phát triển hệ thống hoàn chỉnh với REST API, bảo mật và giao diện React.', 1599000::numeric, 45, 'Advanced', 72, 33),

        ('phat-trien-mobile', 'React Native căn bản: Ứng dụng đa nền tảng', 'react-native-can-ban-da-nen-tang', 'Tạo ứng dụng Android và iOS đầu tiên bằng React Native.', 699000::numeric, 20, 'Beginner', 22, 32),
        ('phat-trien-mobile', 'Flutter thực chiến với Firebase', 'flutter-thuc-chien-firebase', 'Xây dựng ứng dụng Flutter có xác thực, dữ liệu thời gian thực và thông báo.', 1099000::numeric, 30, 'Intermediate', 38, 31),
        ('phat-trien-mobile', 'Android Kotlin từ cơ bản đến ứng dụng hoàn chỉnh', 'android-kotlin-ung-dung-hoan-chinh', 'Làm chủ Kotlin, Jetpack và kiến trúc ứng dụng Android hiện đại.', 1299000::numeric, 35, 'Intermediate', 44, 30),
        ('phat-trien-mobile', 'Thiết kế kiến trúc Mobile có khả năng mở rộng', 'kien-truc-mobile-mo-rong', 'Áp dụng clean architecture, kiểm thử và tối ưu hiệu năng ứng dụng di động.', 1499000::numeric, 25, 'Advanced', 51, 29),

        ('du-lieu-va-ai', 'Tư duy dữ liệu dành cho nhà quản lý', 'tu-duy-du-lieu-cho-nha-quan-ly', 'Đọc hiểu chỉ số, đặt câu hỏi đúng và đưa ra quyết định dựa trên dữ liệu.', 599000::numeric, 15, 'Beginner', 16, 28),
        ('du-lieu-va-ai', 'SQL phân tích dữ liệu trong doanh nghiệp', 'sql-phan-tich-du-lieu-doanh-nghiep', 'Truy vấn, tổng hợp và phân tích bộ dữ liệu kinh doanh bằng SQL.', 749000::numeric, 25, 'Intermediate', 29, 27),
        ('du-lieu-va-ai', 'Power BI Dashboard từ dữ liệu đến quyết định', 'power-bi-dashboard-du-lieu-quyet-dinh', 'Xây dựng dashboard trực quan và kể câu chuyện thuyết phục bằng dữ liệu.', 899000::numeric, 30, 'Intermediate', 35, 26),
        ('du-lieu-va-ai', 'Data Engineering với Python và Airflow', 'data-engineering-python-airflow', 'Thiết kế pipeline dữ liệu tự động, đáng tin cậy và dễ giám sát.', 1399000::numeric, 40, 'Advanced', 48, 25),

        ('khoa-hoc-du-lieu', 'Python cho phân tích dữ liệu', 'python-cho-phan-tich-du-lieu', 'Thực hành NumPy, Pandas và trực quan hóa dữ liệu từ nền tảng.', 799000::numeric, 20, 'Beginner', 26, 24),
        ('khoa-hoc-du-lieu', 'Thống kê ứng dụng không còn khô khan', 'thong-ke-ung-dung-de-hieu', 'Hiểu xác suất, kiểm định và hồi quy qua những tình huống thực tế.', 849000::numeric, 25, 'Intermediate', 33, 23),
        ('khoa-hoc-du-lieu', 'Machine Learning thực hành với Scikit-learn', 'machine-learning-scikit-learn-thuc-hanh', 'Xây dựng, đánh giá và cải thiện mô hình học máy cho dữ liệu thực tế.', 1299000::numeric, 35, 'Intermediate', 57, 22),
        ('khoa-hoc-du-lieu', 'Dự báo chuỗi thời gian cho kinh doanh', 'du-bao-chuoi-thoi-gian-kinh-doanh', 'Dự báo nhu cầu và doanh thu bằng các phương pháp chuỗi thời gian.', 1199000::numeric, 30, 'Advanced', 42, 21),

        ('tri-tue-nhan-tao', 'AI tạo sinh và Prompt Engineering', 'ai-tao-sinh-prompt-engineering', 'Khai thác mô hình AI tạo sinh và thiết kế prompt có hệ thống.', 699000::numeric, 15, 'Beginner', 54, 20),
        ('tri-tue-nhan-tao', 'Deep Learning với PyTorch', 'deep-learning-voi-pytorch', 'Huấn luyện mạng neural và giải quyết bài toán thị giác, phân loại dữ liệu.', 1499000::numeric, 35, 'Advanced', 67, 19),
        ('tri-tue-nhan-tao', 'Xây dựng Chatbot RAG từ tài liệu riêng', 'xay-dung-chatbot-rag', 'Kết hợp LLM, vector database và dữ liệu nội bộ để tạo trợ lý hỏi đáp.', 1699000::numeric, 40, 'Advanced', 83, 18),
        ('tri-tue-nhan-tao', 'Computer Vision: Nhận diện hình ảnh thực tế', 'computer-vision-nhan-dien-hinh-anh', 'Xử lý ảnh và triển khai mô hình nhận diện trong một dự án hoàn chỉnh.', 1599000::numeric, 30, 'Advanced', 61, 17),

        ('thiet-ke-sang-tao', 'Tư duy thiết kế cho người không chuyên', 'tu-duy-thiet-ke-cho-nguoi-khong-chuyen', 'Áp dụng nguyên lý bố cục, màu sắc và kiểu chữ vào sản phẩm hằng ngày.', 499000::numeric, 10, 'Beginner', 19, 16),
        ('thiet-ke-sang-tao', 'Canva thực chiến: Thiết kế nội dung mạng xã hội', 'canva-thiet-ke-noi-dung-mang-xa-hoi', 'Tạo bộ nhận diện và nội dung truyền thông đẹp, nhất quán bằng Canva.', 549000::numeric, 20, 'Beginner', 27, 15),
        ('thiet-ke-sang-tao', 'Adobe Illustrator: Từ vector đến thương hiệu', 'adobe-illustrator-vector-thuong-hieu', 'Làm chủ công cụ vector qua dự án logo và bộ nhận diện thương hiệu.', 999000::numeric, 30, 'Intermediate', 36, 14),
        ('thiet-ke-sang-tao', 'Motion Graphics với After Effects', 'motion-graphics-after-effects', 'Tạo chuyển động chữ, hình khối và video quảng bá thu hút.', 1299000::numeric, 35, 'Advanced', 45, 13),

        ('thiet-ke-ui-ux', 'Figma UI Design cho người mới bắt đầu', 'figma-ui-design-cho-nguoi-moi', 'Thiết kế giao diện web và mobile hoàn chỉnh với Figma.', 649000::numeric, 15, 'Beginner', 32, 12),
        ('thiet-ke-ui-ux', 'UX Research: Hiểu đúng người dùng', 'ux-research-hieu-dung-nguoi-dung', 'Lập kế hoạch nghiên cứu, phỏng vấn và tổng hợp insight người dùng.', 899000::numeric, 25, 'Intermediate', 39, 11),
        ('thiet-ke-ui-ux', 'Design System cho sản phẩm số', 'design-system-cho-san-pham-so', 'Xây dựng component, token và quy trình cộng tác thiết kế nhất quán.', 1199000::numeric, 30, 'Advanced', 53, 10),
        ('thiet-ke-ui-ux', 'Thiết kế trải nghiệm Mobile App thực chiến', 'thiet-ke-trai-nghiem-mobile-app', 'Từ user flow đến prototype kiểm thử cho một ứng dụng di động.', 1099000::numeric, 20, 'Intermediate', 41, 9),

        ('kinh-doanh-va-marketing', 'Digital Marketing toàn diện cho người mới', 'digital-marketing-toan-dien', 'Xây dựng nền tảng về nội dung, quảng cáo, SEO và đo lường.', 699000::numeric, 20, 'Beginner', 37, 8),
        ('kinh-doanh-va-marketing', 'SEO Content: Viết bài lên top bền vững', 'seo-content-len-top-ben-vung', 'Nghiên cứu từ khóa và sản xuất nội dung phù hợp ý định tìm kiếm.', 749000::numeric, 25, 'Intermediate', 46, 7),
        ('kinh-doanh-va-marketing', 'Facebook Ads tối ưu chuyển đổi', 'facebook-ads-toi-uu-chuyen-doi', 'Thiết lập chiến dịch, đọc chỉ số và tối ưu ngân sách quảng cáo.', 999000::numeric, 30, 'Intermediate', 58, 6),
        ('kinh-doanh-va-marketing', 'Khởi nghiệp tinh gọn: Từ ý tưởng đến thị trường', 'khoi-nghiep-tinh-gon-tu-y-tuong', 'Kiểm chứng vấn đề, xây MVP và tìm mô hình kinh doanh phù hợp.', 1199000::numeric, 35, 'Advanced', 64, 5),

        ('ngoai-ngu', 'Tiếng Anh giao tiếp công sở trong 30 ngày', 'tieng-anh-giao-tiep-cong-so-30-ngay', 'Luyện phản xạ trong họp, email và các tình huống giao tiếp nơi làm việc.', 599000::numeric, 15, 'Beginner', 28, 4),
        ('ngoai-ngu', 'IELTS Writing: Chiến lược đạt band 7+', 'ielts-writing-chien-luoc-band-7', 'Phân tích đề, phát triển ý và cải thiện tiêu chí chấm IELTS Writing.', 1099000::numeric, 25, 'Advanced', 49, 3),
        ('ngoai-ngu', 'Tiếng Nhật N5 cho người bắt đầu', 'tieng-nhat-n5-cho-nguoi-bat-dau', 'Học bảng chữ, ngữ pháp và từ vựng nền tảng để chinh phục JLPT N5.', 799000::numeric, 20, 'Beginner', 35, 2),
        ('ngoai-ngu', 'Business English: Thuyết trình và đàm phán', 'business-english-thuyet-trinh-dam-phan', 'Tự tin trình bày ý tưởng và thương lượng bằng tiếng Anh chuyên nghiệp.', 999000::numeric, 30, 'Intermediate', 43, 1)
    ) AS seed(category_slug, title, slug, description, price, discount, level, shared_count, age_days)
    JOIN categories category ON category.slug = seed.category_slug
    ON CONFLICT (slug) DO NOTHING;

    -- Keep records created by this seed public when the script is run again.
    -- Deterministic IDs prevent this from changing user-created courses.
    UPDATE courses
    SET status = 1,
        published_at = COALESCE(published_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE account_id = owner_id
      AND promo_video = '655066/c63829f9-ad28-4567-a474-9988814a8899'
      AND id = md5(slug)::uuid;
END $$;

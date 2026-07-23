-- Seed 50 course categories for manual testing.
-- Run this script manually against the PostgreSQL database.
-- It is intentionally not a Flyway migration.

DO $$
DECLARE
    creator_id UUID;
BEGIN
    SELECT a.id
    INTO creator_id
    FROM accounts a
    LEFT JOIN roles r ON r.id = a.role_id
    WHERE a.deleted_at IS NULL
      AND (
          LOWER(r.name) IN ('admin', 'role_admin', 'instructor', 'role_instructor')
          OR r.name IS NULL
      )
    ORDER BY
      CASE
        WHEN LOWER(r.name) IN ('admin', 'role_admin') THEN 0
        WHEN LOWER(r.name) IN ('instructor', 'role_instructor') THEN 1
        ELSE 2
      END,
      a.created_at NULLS LAST
    LIMIT 1;

    IF creator_id IS NULL THEN
        SELECT id
        INTO creator_id
        FROM accounts
        WHERE deleted_at IS NULL
        ORDER BY created_at NULLS LAST
        LIMIT 1;
    END IF;

    IF creator_id IS NULL THEN
        RAISE EXCEPTION 'Cannot seed categories: no account exists for categories.account_id';
    END IF;

    WITH parent_seed(name, slug, description, color, sort_order, status) AS (
        VALUES
            ('Lập trình & phát triển phần mềm', 'lap-trinh-phat-trien-phan-mem', 'Nền tảng lập trình, kiến trúc và phát triển sản phẩm số.', '#2563EB', 10, 1),
            ('Dữ liệu & trí tuệ nhân tạo', 'du-lieu-tri-tue-nhan-tao', 'Khai phá dữ liệu, AI, machine learning và phân tích.', '#7C3AED', 20, 1),
            ('Thiết kế & sáng tạo', 'thiet-ke-sang-tao', 'Thiết kế giao diện, đồ họa, nội dung và trải nghiệm người dùng.', '#DB2777', 30, 1),
            ('Kinh doanh & khởi nghiệp', 'kinh-doanh-khoi-nghiep', 'Quản trị, vận hành, chiến lược và xây dựng doanh nghiệp.', '#059669', 40, 1),
            ('Marketing & truyền thông', 'marketing-truyen-thong', 'Thu hút khách hàng, nội dung, thương hiệu và tăng trưởng.', '#EA580C', 50, 1),
            ('Ngoại ngữ', 'ngoai-ngu', 'Học ngôn ngữ cho giao tiếp, công việc và học thuật.', '#0891B2', 60, 1),
            ('Kỹ năng cá nhân', 'ky-nang-ca-nhan', 'Tư duy, giao tiếp, năng suất và phát triển bản thân.', '#65A30D', 70, 1),
            ('Tài chính & kế toán', 'tai-chinh-ke-toan', 'Quản lý tiền, đầu tư, kế toán và tài chính doanh nghiệp.', '#CA8A04', 80, 1),
            ('Công nghệ văn phòng', 'cong-nghe-van-phong', 'Ứng dụng công cụ số trong công việc hằng ngày.', '#475569', 90, 0),
            ('Sức khỏe & đời sống', 'suc-khoe-doi-song', 'Sống lành mạnh, cân bằng, chăm sóc sức khỏe và lối sống.', '#DC2626', 100, 1)
    )
    INSERT INTO categories (
        account_id, parent_id, name, slug, description, thumbnail, color, sort_order, status, created_at, updated_at
    )
    SELECT creator_id, NULL, name, slug, description, NULL, color, sort_order, status, NOW(), NOW()
    FROM parent_seed
    ON CONFLICT (slug) DO UPDATE SET
        account_id = EXCLUDED.account_id,
        parent_id = NULL,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        status = EXCLUDED.status,
        updated_at = NOW(),
        deleted_at = NULL;

    WITH child_seed(parent_slug, name, slug, description, color, sort_order, status) AS (
        VALUES
            ('lap-trinh-phat-trien-phan-mem', 'Frontend web', 'frontend-web', 'React, UI component, accessibility và giao diện responsive.', '#3B82F6', 11, 1),
            ('lap-trinh-phat-trien-phan-mem', 'Backend & API', 'backend-api', 'REST API, xử lý phía server, bảo mật và thiết kế service.', '#1D4ED8', 12, 1),
            ('lap-trinh-phat-trien-phan-mem', 'Mobile development', 'mobile-development', 'Phát triển ứng dụng iOS, Android và cross-platform.', '#06B6D4', 13, 1),
            ('lap-trinh-phat-trien-phan-mem', 'DevOps & cloud', 'devops-cloud', 'CI/CD, container, cloud deployment và observability.', '#0F766E', 14, 0),

            ('du-lieu-tri-tue-nhan-tao', 'Data analysis', 'data-analysis', 'Làm sạch, trực quan và phân tích dữ liệu kinh doanh.', '#8B5CF6', 21, 1),
            ('du-lieu-tri-tue-nhan-tao', 'Machine learning', 'machine-learning', 'Mô hình dự đoán, training pipeline và đánh giá model.', '#6D28D9', 22, 1),
            ('du-lieu-tri-tue-nhan-tao', 'Generative AI', 'generative-ai', 'Prompting, AI workflow và ứng dụng tạo sinh nội dung.', '#A855F7', 23, 1),
            ('du-lieu-tri-tue-nhan-tao', 'Data engineering', 'data-engineering', 'ETL, kho dữ liệu, pipeline và xử lý dữ liệu lớn.', '#4C1D95', 24, 0),

            ('thiet-ke-sang-tao', 'UI/UX design', 'ui-ux-design', 'Nghiên cứu người dùng, wireframe, prototype và design system.', '#EC4899', 31, 1),
            ('thiet-ke-sang-tao', 'Graphic design', 'graphic-design', 'Bố cục, màu sắc, typography và thiết kế ấn phẩm số.', '#BE185D', 32, 1),
            ('thiet-ke-sang-tao', 'Video editing', 'video-editing', 'Dựng phim, chỉnh màu, âm thanh và kể chuyện bằng video.', '#F43F5E', 33, 1),
            ('thiet-ke-sang-tao', '3D & motion', '3d-motion', 'Mô hình 3D, animation và chuyển động cho sản phẩm số.', '#9333EA', 34, 0),

            ('kinh-doanh-khoi-nghiep', 'Business strategy', 'business-strategy', 'Mô hình kinh doanh, định vị và chiến lược cạnh tranh.', '#10B981', 41, 1),
            ('kinh-doanh-khoi-nghiep', 'Startup basics', 'startup-basics', 'Ý tưởng, MVP, go-to-market và gọi vốn giai đoạn đầu.', '#047857', 42, 1),
            ('kinh-doanh-khoi-nghiep', 'Operations management', 'operations-management', 'Quy trình, KPI, vận hành đội ngũ và cải tiến liên tục.', '#16A34A', 43, 1),
            ('kinh-doanh-khoi-nghiep', 'Leadership', 'leadership', 'Lãnh đạo nhóm, ra quyết định và phát triển nhân sự.', '#15803D', 44, 0),

            ('marketing-truyen-thong', 'Digital marketing', 'digital-marketing', 'Kênh số, funnel, paid media và đo lường hiệu quả.', '#F97316', 51, 1),
            ('marketing-truyen-thong', 'Content marketing', 'content-marketing', 'Chiến lược nội dung, blog, social và kế hoạch biên tập.', '#EA580C', 52, 1),
            ('marketing-truyen-thong', 'Branding', 'branding', 'Nhận diện thương hiệu, thông điệp và cảm nhận khách hàng.', '#C2410C', 53, 1),
            ('marketing-truyen-thong', 'SEO & analytics', 'seo-analytics', 'Tìm kiếm từ khóa, tối ưu website và phân tích traffic.', '#FB923C', 54, 0),

            ('ngoai-ngu', 'Tiếng Anh giao tiếp', 'tieng-anh-giao-tiep', 'Phản xạ giao tiếp, phát âm và tình huống hằng ngày.', '#0EA5E9', 61, 1),
            ('ngoai-ngu', 'Tiếng Anh học thuật', 'tieng-anh-hoc-thuat', 'Đọc viết học thuật, thuyết trình và luyện thi.', '#0284C7', 62, 1),
            ('ngoai-ngu', 'Tiếng Nhật', 'tieng-nhat', 'Ngữ pháp, từ vựng, giao tiếp và văn hóa Nhật Bản.', '#0369A1', 63, 1),
            ('ngoai-ngu', 'Tiếng Hàn', 'tieng-han', 'Nhập môn Hangul, hội thoại và tiếng Hàn công việc.', '#075985', 64, 0),

            ('ky-nang-ca-nhan', 'Communication skills', 'communication-skills', 'Lắng nghe, thuyết phục, trình bày và giải quyết xung đột.', '#84CC16', 71, 1),
            ('ky-nang-ca-nhan', 'Productivity', 'productivity', 'Quản lý thời gian, ưu tiên công việc và thói quen tập trung.', '#65A30D', 72, 1),
            ('ky-nang-ca-nhan', 'Critical thinking', 'critical-thinking', 'Tư duy phản biện, giải quyết vấn đề và ra quyết định.', '#4D7C0F', 73, 1),
            ('ky-nang-ca-nhan', 'Career development', 'career-development', 'CV, phỏng vấn, networking và lộ trình nghề nghiệp.', '#3F6212', 74, 0),

            ('tai-chinh-ke-toan', 'Personal finance', 'personal-finance', 'Ngân sách, tiết kiệm, nợ, bảo hiểm và mục tiêu tài chính.', '#EAB308', 81, 1),
            ('tai-chinh-ke-toan', 'Investing basics', 'investing-basics', 'Nguyên tắc đầu tư, rủi ro, danh mục và tâm lý thị trường.', '#A16207', 82, 1),
            ('tai-chinh-ke-toan', 'Accounting basics', 'accounting-basics', 'Báo cáo tài chính, bút toán cơ bản và quy trình kế toán.', '#854D0E', 83, 1),
            ('tai-chinh-ke-toan', 'Business finance', 'business-finance', 'Dòng tiền, ngân sách doanh nghiệp và chỉ số tài chính.', '#713F12', 84, 0),

            ('cong-nghe-van-phong', 'Excel & spreadsheets', 'excel-spreadsheets', 'Hàm, pivot table, dashboard và tự động hóa bảng tính.', '#64748B', 91, 0),
            ('cong-nghe-van-phong', 'Presentation tools', 'presentation-tools', 'Thiết kế slide, kể chuyện bằng dữ liệu và thuyết trình.', '#475569', 92, 0),
            ('cong-nghe-van-phong', 'No-code automation', 'no-code-automation', 'Tự động hóa quy trình với các công cụ không cần code.', '#334155', 93, 0),
            ('cong-nghe-van-phong', 'Remote collaboration', 'remote-collaboration', 'Làm việc nhóm, tài liệu chung và quy tắc họp trực tuyến.', '#1E293B', 94, 0),

            ('suc-khoe-doi-song', 'Nutrition', 'nutrition', 'Dinh dưỡng cân bằng, lập kế hoạch bữa ăn và đọc nhãn thực phẩm.', '#EF4444', 101, 1),
            ('suc-khoe-doi-song', 'Fitness', 'fitness', 'Tập luyện cơ bản, sức bền, sức mạnh và phòng tránh chấn thương.', '#B91C1C', 102, 1),
            ('suc-khoe-doi-song', 'Mental wellness', 'mental-wellness', 'Quản lý căng thẳng, thực hành tinh thần và cân bằng sống.', '#991B1B', 103, 1),
            ('suc-khoe-doi-song', 'Lifestyle design', 'lifestyle-design', 'Thói quen sống, môi trường cá nhân và kế hoạch dài hạn.', '#7F1D1D', 104, 0)
    )
    INSERT INTO categories (
        account_id, parent_id, name, slug, description, thumbnail, color, sort_order, status, created_at, updated_at
    )
    SELECT creator_id, p.id, c.name, c.slug, c.description, NULL, c.color, c.sort_order, c.status, NOW(), NOW()
    FROM child_seed c
    JOIN categories p ON p.slug = c.parent_slug
    ON CONFLICT (slug) DO UPDATE SET
        account_id = EXCLUDED.account_id,
        parent_id = EXCLUDED.parent_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        color = EXCLUDED.color,
        sort_order = EXCLUDED.sort_order,
        status = EXCLUDED.status,
        updated_at = NOW(),
        deleted_at = NULL;
END $$;

SELECT
    COUNT(*) AS seeded_course_categories
FROM categories
WHERE slug IN (
    'lap-trinh-phat-trien-phan-mem', 'du-lieu-tri-tue-nhan-tao', 'thiet-ke-sang-tao',
    'kinh-doanh-khoi-nghiep', 'marketing-truyen-thong', 'ngoai-ngu', 'ky-nang-ca-nhan',
    'tai-chinh-ke-toan', 'cong-nghe-van-phong', 'suc-khoe-doi-song',
    'frontend-web', 'backend-api', 'mobile-development', 'devops-cloud',
    'data-analysis', 'machine-learning', 'generative-ai', 'data-engineering',
    'ui-ux-design', 'graphic-design', 'video-editing', '3d-motion',
    'business-strategy', 'startup-basics', 'operations-management', 'leadership',
    'digital-marketing', 'content-marketing', 'branding', 'seo-analytics',
    'tieng-anh-giao-tiep', 'tieng-anh-hoc-thuat', 'tieng-nhat', 'tieng-han',
    'communication-skills', 'productivity', 'critical-thinking', 'career-development',
    'personal-finance', 'investing-basics', 'accounting-basics', 'business-finance',
    'excel-spreadsheets', 'presentation-tools', 'no-code-automation', 'remote-collaboration',
    'nutrition', 'fitness', 'mental-wellness', 'lifestyle-design'
);

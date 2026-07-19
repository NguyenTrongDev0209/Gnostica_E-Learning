-- Idempotent development seed for testing course moderation and category visibility.
-- Run this after seed-course-catalog.sql and seed-instructor-courses.sql.

DO $$
BEGIN
    -- Category only supports two states: visible (1) and hidden (0).
    UPDATE categories
    SET status = CASE
        WHEN slug IN ('phat-trien-mobile', 'thiet-ke-ui-ux') THEN 0
        ELSE 1
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE slug IN (
        'cong-nghe-thong-tin', 'du-lieu-va-ai', 'thiet-ke-sang-tao',
        'kinh-doanh-va-marketing', 'ngoai-ngu', 'lap-trinh-web',
        'phat-trien-mobile', 'khoa-hoc-du-lieu', 'tri-tue-nhan-tao',
        'thiet-ke-ui-ux'
    );

    -- Approved/public courses.
    UPDATE courses
    SET status = 1,
        reject_reason = NULL,
        published_at = COALESCE(published_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE slug IN (
        'nodejs-express-rest-api-minh-le',
        'nextjs-fullstack-app-router-minh-le',
        'docker-ci-cd-du-an-web-minh-le',
        'excel-power-query-minh-quoc',
        'python-plotly-minh-quoc',
        'google-ads-toi-uu-roi-minh-quoc',
        'vuejs-3-pinia-dragon-minh-le',
        'tu-dong-hoa-ai-agent-dragon-minh-le',
        'content-marketing-da-kenh-dragon-minh-le'
    )
      AND id = md5(slug)::uuid;

    -- Pending moderation courses.
    UPDATE courses
    SET status = 4,
        reject_reason = NULL,
        published_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE slug IN (
        'expo-react-native-ra-mat-ung-dung-minh-le',
        'ung-dung-ai-quy-trinh-lap-trinh-minh-le',
        'machine-learning-marketing-minh-quoc',
        'thuong-hieu-ca-nhan-linkedin-minh-quoc',
        'ios-swiftui-dragon-minh-le',
        'ui-animation-micro-interaction-dragon-minh-le'
    )
      AND id = md5(slug)::uuid;

    -- Rejected courses with realistic moderation feedback.
    UPDATE courses
    SET status = 3,
        reject_reason = CASE slug
            WHEN 'figma-den-react-chinh-xac-minh-le'
                THEN 'Nội dung giới thiệu chưa mô tả rõ mục tiêu học tập và yêu cầu đầu vào.'
            WHEN 'tieng-anh-phong-van-cong-nghe-minh-quoc'
                THEN 'Vui lòng bổ sung đề cương chi tiết và bài học mẫu trước khi gửi duyệt lại.'
            WHEN 'tieng-anh-lap-trinh-vien-dragon-minh-le'
                THEN 'Thumbnail và mô tả khóa học cần thể hiện rõ hơn nội dung dành cho ngành IT.'
            ELSE 'Khóa học cần được chỉnh sửa trước khi xuất bản.'
        END,
        published_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE slug IN (
        'figma-den-react-chinh-xac-minh-le',
        'tieng-anh-phong-van-cong-nghe-minh-quoc',
        'tieng-anh-lap-trinh-vien-dragon-minh-le'
    )
      AND id = md5(slug)::uuid;
END $$;

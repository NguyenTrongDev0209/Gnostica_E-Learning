-- Seed 100 realistic course categories for manual testing.
-- Run this script manually against the PostgreSQL database.
-- It is intentionally not a Flyway migration.

DO $$
DECLARE
    creator_id UUID;
BEGIN
    -- Select admin or instructor account
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

    -- Delete dummy categories if existing
    DELETE FROM categories WHERE slug LIKE 'danh-muc-%';

    -- Insert 20 Parent Categories
    WITH parent_seed(name, slug, description, color, sort_order, status) AS (
        VALUES
            ('Lập trình & Phát triển Phần mềm', 'lap-trinh-phat-trien-software', 'Kiến thức lập trình, thiết kế kiến trúc và phát triển phần mềm.', '#2563EB', 10, 1),
            ('Dữ liệu & Trí tuệ Nhân tạo', 'du-lieu-ai', 'Khai phá dữ liệu, Machine Learning, Deep Learning và Generative AI.', '#7C3AED', 20, 1),
            ('An ninh mạng & Hệ thống', 'an-ninh-mang-he-thong', 'Bảo mật thông tin, quản trị mạng và hạ tầng điện toán đám mây.', '#059669', 30, 1),
            ('Thiết kế & Trải nghiệm Người dùng', 'thiet-ke-ux-ui', 'Sáng tạo giao diện, đồ họa và sản phẩm truyền thông đa phương tiện.', '#DB2777', 40, 1),
            ('Marketing & Truyền thông Số', 'marketing-truyen-thong-so', 'Tiếp thị đa kênh, thu hút khách hàng và xây dựng thương hiệu.', '#EA580C', 50, 1),
            ('Kinh doanh & Quản trị', 'kinh-doanh-quan-tri', 'Vận hành doanh nghiệp, khởi nghiệp và kỹ năng quản lý.', '#D97706', 60, 1),
            ('Tài chính, Đầu tư & Kế toán', 'tai-chinh-dau-tu-ke-toan', 'Quản lý dòng tiền, đầu tư sinh lời và kế toán tài chính.', '#CA8A04', 70, 1),
            ('Ngoại ngữ & Chứng chỉ', 'ngoai-ngu-chung-chi', 'Học các ngôn ngữ phổ biến và luyện thi chứng chỉ quốc tế.', '#0891B2', 80, 1),
            ('Kỹ năng Phát triển Bản thân', 'phat-trien-ban-than', 'Rèn luyện tư duy, kỹ năng mềm và nâng cao năng suất.', '#65A30D', 90, 1),
            ('Bán hàng & Chăm sóc Khách hàng', 'ban-hang-cskh', 'Quy trình bán hàng chốt đơn và nâng cao trải nghiệm khách hàng.', '#475569', 100, 1),
            ('Nhiếp ảnh & Quay phim', 'nhiep-anh-quay-phim', 'Nghệ thuật nhiếp ảnh, ánh sáng và quay clip chuyên nghiệp.', '#DC2626', 110, 1),
            ('Âm nhạc & Kỹ thuật Âm thanh', 'am-nhac-am-thanh', 'Học nhạc cụ, luyện giọng và sản xuất âm thanh.', '#F59E0B', 120, 1),
            ('Sức khỏe, Gym & Thể thao', 'suc-khoe-gym-the-thao', 'Chăm sóc thể chất, tập luyện và dinh dưỡng khoa học.', '#16A34A', 130, 1),
            ('Ẩm thực & Pha chế', 'am-thuc-pha-che', 'Bí quyết nấu ăn, làm bánh và pha chế đồ uống hấp dẫn.', '#B91C1C', 140, 1),
            ('Chăm sóc Gia đình & Làm mẹ', 'cham-soc-gia-dinh-lam-me', 'Kiến thức nuôi dạy con, gia đình và quản lý nhà cửa.', '#EC4899', 150, 1),
            ('Học thuật & Khoa học Tự nhiên', 'hoc-thuat-khoa-hoc', 'Nền tảng toán học, lý hóa và ứng dụng tâm lý học.', '#4F46E5', 160, 1),
            ('Kiến trúc & Nội thất', 'kien-truc-noi-that', 'Quy hoạch kiến trúc, dựng phối cảnh và thi công công trình.', '#0284C7', 170, 1),
            ('Thủ công & Nghệ thuật Sáng tạo', 'thu-cong-nghe-thuat', 'Sáng tạo nghệ thuật thủ công, hội họa và thời trang.', '#9333EA', 180, 1),
            ('Thương mại Điện tử & Dropshipping', 'tmdt-dropshipping', 'Mô hình bán hàng không kho, kinh doanh toàn cầu.', '#0D9488', 190, 1),
            ('Luật & Pháp lý Doanh nghiệp', 'luat-phap-ly', 'Kiến thức pháp luật kinh doanh, hợp đồng và bản quyền.', '#374151', 200, 1)
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

    -- Insert 80 Child Categories
    WITH child_seed(parent_slug, name, slug, description, color, sort_order, status) AS (
        VALUES
            ('lap-trinh-phat-trien-software', 'Lập trình Frontend Web', 'frontend-web-dev', 'HTML, CSS, JavaScript, React, Vue và UI responsiveness.', '#3B82F6', 11, 1),
            ('lap-trinh-phat-trien-software', 'Lập trình Backend & API', 'backend-api-dev', 'Java Spring, Node.js, Python, REST API và microservices.', '#1D4ED8', 12, 1),
            ('lap-trinh-phat-trien-software', 'Lập trình Di động', 'mobile-app-dev', 'Flutter, React Native, iOS Swift và Android Kotlin.', '#06B6D4', 13, 1),
            ('lap-trinh-phat-trien-software', 'Lập trình Game', 'game-development', 'Unity, Unreal Engine, C# và thiết kế logic game.', '#0F766E', 14, 1),
            ('du-lieu-ai', 'Khoa học Dữ liệu (Data Science)', 'data-science-pro', 'Phân tích dữ liệu, trực quan hóa và mô hình thống kê.', '#8B5CF6', 21, 1),
            ('du-lieu-ai', 'Học máy & Deep Learning', 'machine-deep-learning', 'Mô hình dự đoán, mạng nơ-ron và thị giác máy tính.', '#6D28D9', 22, 1),
            ('du-lieu-ai', 'Generative AI & Prompt Engineering', 'generative-ai-prompt', 'Ứng dụng ChatGPT, Midjourney và tự động hóa AI.', '#A855F7', 23, 1),
            ('du-lieu-ai', 'Kỹ thuật Dữ liệu (Data Engineering)', 'data-engineering-pipeline', 'Xây dựng data pipeline, kho dữ liệu và xử lý Big Data.', '#4C1D95', 24, 1),
            ('an-ninh-mang-he-thong', 'Quản trị Mạng', 'network-administration', 'Cisco, Router, Switch và định tuyến hạ tầng mạng.', '#10B981', 31, 1),
            ('an-ninh-mang-he-thong', 'Bảo mật & Penetration Testing', 'cyber-security-pentest', 'Đánh giá lỗ hổng, kiểm thử xâm nhập và phòng vệ mạng.', '#047857', 32, 1),
            ('an-ninh-mang-he-thong', 'Cloud Computing & DevOps', 'cloud-devops-system', 'Docker, Kubernetes, CI/CD và quản trị hạ tầng.', '#16A34A', 33, 1),
            ('an-ninh-mang-he-thong', 'Điện toán Đám mây AWS/Azure', 'aws-azure-cloud', 'Kiến trúc cloud AWS, Azure và Google Cloud Platform.', '#15803D', 34, 1),
            ('thiet-ke-ux-ui', 'Thiết kế UI/UX', 'ui-ux-design-expert', 'Figma, Wireframe, Prototype và Design System.', '#EC4899', 41, 1),
            ('thiet-ke-ux-ui', 'Thiết kế Đồ họa (Graphic Design)', 'graphic-design-art', 'Photoshop, Illustrator, nhận diện thương hiệu và in ấn.', '#BE185D', 42, 1),
            ('thiet-ke-ux-ui', 'Dựng phim & Edit Video', 'video-editing-production', 'Premiere Pro, CapCut, chỉnh màu và kỹ xảo điện ảnh.', '#F43F5E', 43, 1),
            ('thiet-ke-ux-ui', 'Hoạt hình & 3D Motion', 'animation-3d-motion', 'After Effects, Blender, mô hình 3D và chuyển động đồ họa.', '#9333EA', 44, 1),
            ('marketing-truyen-thong-so', 'Digital Marketing', 'digital-marketing-growth', 'Chiến lược tiếp thị số, phễu bán hàng và tăng trưởng.', '#F97316', 51, 1),
            ('marketing-truyen-thong-so', 'Content Marketing & Copywriting', 'content-copywriting-pro', 'Viết bài bán hàng, sáng tạo nội dung mạng xã hội.', '#EA580C', 52, 1),
            ('marketing-truyen-thong-so', 'SEO & Marketing Tìm kiếm', 'seo-search-marketing', 'Tối ưu công cụ tìm kiếm, Google Ads và từ khóa.', '#C2410C', 53, 1),
            ('marketing-truyen-thong-so', 'Quảng cáo Social Media', 'social-media-ads', 'Facebook Ads, TikTok Ads và Instagram Marketing.', '#FB923C', 54, 1),
            ('kinh-doanh-quan-tri', 'Khởi nghiệp & Startup', 'startup-business-ideas', 'Xây dựng mô hình kinh doanh, gọi vốn và phát triển MVP.', '#F59E0B', 61, 1),
            ('kinh-doanh-quan-tri', 'Quản trị Sản phẩm (Product Management)', 'product-management-master', 'Định hướng sản phẩm, lập roadmap và quản lý tính năng.', '#B45309', 62, 1),
            ('kinh-doanh-quan-tri', 'Vận hành Doanh nghiệp', 'business-operations-management', 'Quản lý quy trình, KPI, OKR và tối ưu bộ máy làm việc.', '#92400E', 63, 1),
            ('kinh-doanh-quan-tri', 'Chiến lược & Quản trị Rủi ro', 'business-strategy-risk', 'Phân tích đối thủ, lập chiến lược và kiểm soát rủi ro.', '#78350F', 64, 1),
            ('tai-chinh-dau-tu-ke-toan', 'Tài chính Cá nhân', 'personal-finance-plan', 'Lập ngân sách, tiết kiệm, quản lý nợ và tự do tài chính.', '#EAB308', 71, 1),
            ('tai-chinh-dau-tu-ke-toan', 'Đầu tư Chứng khoán', 'stock-market-investment', 'Phân tích kỹ thuật, phân tích cơ bản và quản lý danh mục.', '#A16207', 72, 1),
            ('tai-chinh-dau-tu-ke-toan', 'Kế toán & Phân tích Tài chính', 'accounting-financial-analysis', 'Đọc báo cáo tài chính, kế toán doanh nghiệp và thuế.', '#854D0E', 73, 1),
            ('tai-chinh-dau-tu-ke-toan', 'Tiền mã hóa & Blockchain', 'crypto-blockchain-fintech', 'Công nghệ Blockchain, Smart Contract và thị trường Crypto.', '#713F12', 74, 1),
            ('ngoai-ngu-chung-chi', 'Tiếng Anh Giao tiếp & Công việc', 'business-english-communication', 'Tiếng Anh thương mại, phát âm chuẩn và viết email.', '#0EA5E9', 81, 1),
            ('ngoai-ngu-chung-chi', 'Luyện thi IELTS / TOEIC', 'ielts-toeic-preparation', 'Bí quyết đạt điểm cao 4 kỹ năng Nghe, Nói, Đọc, Viết.', '#0284C7', 82, 1),
            ('ngoai-ngu-chung-chi', 'Tiếng Nhật Thương mại', 'business-japanese-n1-n5', 'Từ vựng, ngữ pháp N5-N1 và giao tiếp công sở Nhật Bản.', '#0369A1', 83, 1),
            ('ngoai-ngu-chung-chi', 'Tiếng Hàn & Tiếng Trung', 'korean-chinese-languages', 'Tiếng Trung HSK, tiếng Hàn TOPIK cho người đi làm.', '#075985', 84, 1),
            ('phat-trien-ban-than', 'Quản lý Thời gian & Năng suất', 'time-management-productivity', 'Phương pháp Pomodoro, Getting Things Done và kỷ luật.', '#84CC16', 91, 1),
            ('phat-trien-ban-than', 'Giao tiếp & Thuyết trình', 'communication-public-speaking', 'Nói trước đám đông, thuyết phục và làm chủ ngôn ngữ cơ thể.', '#65A30D', 92, 1),
            ('phat-trien-ban-than', 'Tư duy Logic & Phản biện', 'critical-logical-thinking', 'Giải quyết vấn đề phức tạp và ra quyết định sáng suốt.', '#4D7C0F', 93, 1),
            ('phat-trien-ban-than', 'Đàm phán & Giải quyết Xung đột', 'negotiation-conflict-resolution', 'Kỹ năng thương lượng, chốt deal và xử lý mâu thuẫn.', '#3F6212', 94, 1),
            ('ban-hang-cskh', 'Kỹ năng Bán hàng (Sales Mastery)', 'sales-mastery-skills', 'Tìm kiếm khách hàng tiềm năng, xử lý từ chối và chốt sales.', '#64748B', 101, 1),
            ('ban-hang-cskh', 'Bán hàng Thương mại Điện tử', 'ecommerce-sales-shopee-tiktok', 'Xây dựng gian hàng Shopee, Lazada, TikTok Shop.', '#475569', 102, 1),
            ('ban-hang-cskh', 'Chăm sóc & Trải nghiệm Khách hàng', 'customer-experience-service', 'Quản lý quan hệ khách hàng CRM, giữ chân khách hàng.', '#334155', 103, 1),
            ('ban-hang-cskh', 'Quản lý Kênh Phân phối', 'distribution-channel-management', 'Phát triển đại lý, điểm bán và chuỗi cung ứng.', '#1E293B', 104, 1),
            ('nhiep-anh-quay-phim', 'Nhiếp ảnh Căn bản & Chân dung', 'portrait-photography-basic', 'Bố cục ảnh, làm chủ máy ảnh DSLR/Mirrorless và góc máy.', '#EF4444', 111, 1),
            ('nhiep-anh-quay-phim', 'Nhiếp ảnh Sản phẩm', 'product-photography-studio', 'Chụp ảnh thương mại, sản phẩm quảng cáo và setup studio.', '#B91C1C', 112, 1),
            ('nhiep-anh-quay-phim', 'Quay phim & Dựng clip Ngắn', 'short-video-creation-tiktok-reels', 'Sáng tạo video TikTok, Reels, YouTube Shorts hút view.', '#991B1B', 113, 1),
            ('nhiep-anh-quay-phim', 'Xử lý Đạo cụ & Ánh sáng', 'lighting-studio-setup', 'Kỹ thuật đánh đèn studio, tản sáng và tạo hiệu ứng.', '#7F1D1D', 114, 1),
            ('am-nhac-am-thanh', 'Học Nhạc cụ (Guitar, Piano, Ukulele)', 'musical-instruments-play', 'Đệm hát căn bản, đọc bản nhạc và kỹ thuật ngón.', '#FBBF24', 121, 1),
            ('am-nhac-am-thanh', 'Phối khí & Sản xuất Nhạc', 'music-production-mixing', 'Sử dụng FL Studio, Ableton Live, thu âm và mixing.', '#D97706', 122, 1),
            ('am-nhac-am-thanh', 'Thanh nhạc & Luyện giọng', 'vocal-training-singing', 'Kỹ thuật lấy hơi, mở khẩu hình và kiểm soát cao độ.', '#B45309', 123, 1),
            ('am-nhac-am-thanh', 'Podcast & Thu âm', 'podcasting-audio-recording', 'Xây dựng kênh Podcast, xử lý tạp âm và biên tập audio.', '#92400E', 124, 1),
            ('suc-khoe-gym-the-thao', 'Gym & Fitness', 'home-gym-fitness-bodybuilding', 'Lịch tập tăng cơ giảm mỡ, kỹ thuật tập đúng form.', '#22C55E', 131, 1),
            ('suc-khoe-gym-the-thao', 'Yoga & Thiền định', 'yoga-meditation-mindfulness', 'Bài tập Yoga dẻo dai, thở đúng cách và thư giãn tinh thần.', '#16A34A', 132, 1),
            ('suc-khoe-gym-the-thao', 'Dinh dưỡng & Giảm cân', 'nutrition-diet-weightloss', 'Tính Calo, Macro, chế độ ăn Eat Clean và Keto.', '#15803D', 133, 1),
            ('suc-khoe-gym-the-thao', 'Thể thao & Phục hồi Chấn thương', 'sports-recovery-physio', 'Khởi động, giãn cơ và phòng tránh chấn thương thể thao.', '#14532D', 134, 1),
            ('am-thuc-pha-che', 'Nấu ăn Gia đình & Á-Âu', 'home-cooking-asian-western', 'Công thức món ăn Việt Nam, Hàn Quốc, Nhật Bản và đồ Âu.', '#EF4444', 141, 1),
            ('am-thuc-pha-che', 'Làm bánh & Tráng miệng', 'baking-pastry-craft', 'Bánh kem, bánh mì, bánh ngọt trang trí chuyên nghiệp.', '#DC2626', 142, 1),
            ('am-thuc-pha-che', 'Pha chế Cà phê & Barista', 'barista-coffee-brewing', 'Pha cà phê Phin, Espresso, Latte Art và trà sữa.', '#B91C1C', 143, 1),
            ('am-thuc-pha-che', 'Pha chế Bartender & Cocktails', 'bartending-cocktail-mixing', 'Kỹ thuật lắc shaker, kết hợp nguyên liệu và trang trí ly.', '#991B1B', 144, 1),
            ('cham-soc-gia-dinh-lam-me', 'Thai kỳ & Chăm sóc Trẻ sơ sinh', 'pregnancy-newborn-care', 'Dinh dưỡng thai kỳ, chăm sóc bé y khoa và tắm bé.', '#F472B6', 151, 1),
            ('cham-soc-gia-dinh-lam-me', 'Nuôi dạy Con cái (Parenting)', 'parenting-child-education', 'Phương pháp giáo dục sớm, thấu hiểu tâm lý trẻ nhỏ.', '#DB2777', 152, 1),
            ('cham-soc-gia-dinh-lam-me', 'Trang trí & Sắp xếp Nhà cửa', 'home-decor-organization', 'Phong cách tối giản Marie Kondo, dọn dẹp không gian sống.', '#BE185D', 153, 1),
            ('cham-soc-gia-dinh-lam-me', 'Chăm sóc Thú cưng', 'pet-care-training', 'Huấn luyện chó mèo, dinh dưỡng và vệ sinh thú cưng.', '#9D174D', 154, 1),
            ('hoc-thuat-khoa-hoc', 'Toán học & Thống kê', 'math-statistics-fundamentals', 'Đại số, xác suất thống kê và ứng dụng tính toán.', '#6366F1', 161, 1),
            ('hoc-thuat-khoa-hoc', 'Vật lý & Kỹ thuật Cơ khí', 'physics-mechanical-engineering', 'Nguyên lý vận hành máy móc, mạch điện và tự động hóa.', '#4F46E5', 162, 1),
            ('hoc-thuat-khoa-hoc', 'Sinh học & Y học Thường thức', 'biology-general-medicine', 'Giải phẫu cơ thể người, vi sinh vật và chăm sóc y tế.', '#4338CA', 163, 1),
            ('hoc-thuat-khoa-hoc', 'Tâm lý học Ứng dụng', 'applied-psychology-mind', 'Đọc vị hành vi, tâm lý nhận thức và chữa lành nội tâm.', '#3730A3', 164, 1),
            ('kien-truc-noi-that', 'Thiết kế Nội thất', 'interior-design-concept', 'Phối màu không gian, chọn chất liệu và bài trí nội thất.', '#38BDF8', 171, 1),
            ('kien-truc-noi-that', 'AutoCAD & SketchUp 3D', 'autocad-sketchup-3d-modeling', 'Vẽ bản kỹ thuật 2D, dựng hình 3D nhà ở và công trình.', '#0284C7', 172, 1),
            ('kien-truc-noi-that', 'Kiến trúc Xanh & Phong thủy', 'green-architecture-phong-thuy', 'Bố trí phong thủy nhà ở, chiếu sáng và thông gió tự nhiên.', '#0369A1', 173, 1),
            ('kien-truc-noi-that', 'Quản lý Thi công Xây dựng', 'construction-management-site', 'Bóc tách khối lượng, dự toán chi phí và giám sát công trình.', '#075985', 174, 1),
            ('thu-cong-nghe-thuat', 'Hội họa & Vẽ Màu nước', 'painting-watercolor-art', 'Kỹ thuật phối màu, vẽ tranh phong cảnh và chân dung.', '#A855F7', 181, 1),
            ('thu-cong-nghe-thuat', 'Đồ Handmade & Gốm', 'handmade-crafts-pottery', 'Tạo hình gốm sứ, đan móc len và làm nến thơm.', '#9333EA', 182, 1),
            ('thu-cong-nghe-thuat', 'May vá & Thiết kế Thời trang', 'fashion-design-sewing', 'Cắt may quần áo cơ bản, thiết kế rập và chất liệu vải.', '#7E22CE', 183, 1),
            ('thu-cong-nghe-thuat', 'Viết chữ Nghệ thuật (Calligraphy)', 'calligraphy-hand-lettering', 'Nghệ thuật viết chữ nét thanh nét đậm, nét cọ Brush Pen.', '#6B21A8', 184, 1),
            ('tmdt-dropshipping', 'Mô hình Dropshipping', 'dropshipping-global-model', 'Tìm nguồn hàng, xây dựng store Shopify và bán hàng toàn cầu.', '#14B8A6', 191, 1),
            ('tmdt-dropshipping', 'Xây dựng Gian hàng Shopee / Lazada', 'shopee-lazada-store-building', 'Tối ưu gian hàng chuẩn SEO, chạy quảng cáo nội sàn.', '#0D9488', 192, 1),
            ('tmdt-dropshipping', 'TikTok Shop Mastery', 'tiktok-shop-affiliate', 'Kinh doanh TikTok Shop, làm Affiliate Marketing tiếp thị liên kết.', '#0F766E', 193, 1),
            ('tmdt-dropshipping', 'Quản lý Đơn hàng & Logistics', 'logistics-order-fulfillment', 'Đóng gói, vận chuyển, đối soát và xử lý hàng hoàn.', '#115E59', 194, 1),
            ('luat-phap-ly', 'Luật Doanh nghiệp & Hợp đồng', 'corporate-law-contracts', 'Soạn thảo hợp đồng kinh tế, thủ tục thành lập công ty.', '#4B5563', 201, 1),
            ('luat-phap-ly', 'Sở hữu Trí tuệ & Bản quyền', 'intellectual-property-copyright', 'Đăng ký nhãn hiệu, bảo hộ bản quyền phần mềm và thương hiệu.', '#374151', 202, 1),
            ('luat-phap-ly', 'Pháp lý Lao động & BHXH', 'labor-law-social-insurance', 'Hợp đồng lao động, quy chế công ty và chính sách bảo hiểm.', '#1F2937', 203, 1),
            ('luat-phap-ly', 'Pháp lý Khởi nghiệp (Startup Legal)', 'startup-legal-compliance', 'Thỏa thuận cổ đông (SHA), tư vấn cổ phần ESOP và tuân thủ.', '#111827', 204, 1)
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

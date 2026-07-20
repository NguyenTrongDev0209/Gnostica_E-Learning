-- Idempotent forum catalog and rich sample content.
-- Topic ownership is restricted to active ADMIN/INSTRUCTOR accounts.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM accounts a JOIN roles r ON r.id = a.role_id
        WHERE r.name = 'ADMIN' AND a.status = 1 AND a.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Cannot seed forum: no active ADMIN account exists';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM accounts a JOIN roles r ON r.id = a.role_id
        WHERE r.name = 'INSTRUCTOR' AND a.status = 1 AND a.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Cannot seed forum: no active INSTRUCTOR account exists';
    END IF;
END $$;

WITH owners AS (
    SELECT
        (SELECT a.id FROM accounts a JOIN roles r ON r.id = a.role_id
         WHERE r.name = 'ADMIN' AND a.status = 1 AND a.deleted_at IS NULL ORDER BY a.created_at LIMIT 1) AS admin_id,
        (SELECT a.id FROM accounts a JOIN roles r ON r.id = a.role_id
         WHERE r.name = 'INSTRUCTOR' AND a.status = 1 AND a.deleted_at IS NULL ORDER BY a.created_at LIMIT 1) AS instructor_id
), topic_seed(title, slug, description, status, owner_type, days_ago) AS (
    VALUES
        ('Thông báo từ Gnostica', 'thong-bao-gnostica', 'Tin tức, cập nhật và quy định chính thức từ nền tảng.', 1, 'ADMIN', 45),
        ('Lập trình và Công nghệ', 'lap-trinh-cong-nghe', 'Trao đổi về lập trình, hệ thống, bảo mật và xu hướng công nghệ.', 1, 'INSTRUCTOR', 40),
        ('Dữ liệu và Trí tuệ nhân tạo', 'du-lieu-tri-tue-nhan-tao', 'Machine Learning, AI tạo sinh, phân tích và trực quan hóa dữ liệu.', 1, 'INSTRUCTOR', 35),
        ('Thiết kế UI/UX', 'thiet-ke-ui-ux-forum', 'Chia sẻ quy trình nghiên cứu, thiết kế và kiểm thử trải nghiệm.', 1, 'INSTRUCTOR', 30),
        ('Học tập và Phát triển nghề nghiệp', 'hoc-tap-phat-trien-nghe-nghiep', 'Kinh nghiệm học tập, portfolio, phỏng vấn và định hướng nghề nghiệp.', 1, 'ADMIN', 25),
        ('Góc hỏi đáp cùng giảng viên', 'hoi-dap-cung-giang-vien', 'Nơi học viên đặt câu hỏi và nhận hướng dẫn từ giảng viên.', 1, 'INSTRUCTOR', 20),
        ('Chủ đề nội bộ', 'chu-de-noi-bo', 'Khu vực thử nghiệm nội dung chưa công khai.', 0, 'ADMIN', 10)
)
INSERT INTO topics(account_id, title, slug, description, status, created_at, updated_at)
SELECT CASE WHEN s.owner_type = 'ADMIN' THEN o.admin_id ELSE o.instructor_id END,
       s.title, s.slug, s.description, s.status,
       CURRENT_TIMESTAMP - make_interval(days => s.days_ago), CURRENT_TIMESTAMP
FROM topic_seed s CROSS JOIN owners o
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP,
    deleted_at = NULL;

WITH author_pool AS (
    SELECT a.id, a.email, r.name AS role_name,
           row_number() OVER (PARTITION BY r.name ORDER BY a.created_at, a.id) AS role_order
    FROM accounts a JOIN roles r ON r.id = a.role_id
    WHERE r.name IN ('ADMIN', 'INSTRUCTOR') AND a.status = 1 AND a.deleted_at IS NULL
), thread_seed(title, slug, topic_slug, author_role, author_order, content, views, shares, locked, pinned, status, days_ago) AS (
    VALUES
      ('Chào mừng bạn đến với cộng đồng Gnostica', 'chao-mung-cong-dong-gnostica', 'thong-bao-gnostica', 'ADMIN', 1,
       '<h2>Chào mừng đến với diễn đàn Gnostica!</h2><p>Đây là nơi chúng ta cùng trao đổi kiến thức, hỗ trợ nhau trong học tập và xây dựng một cộng đồng tích cực.</p><blockquote>Hãy tôn trọng, chia sẻ có nguồn và bảo vệ thông tin cá nhân.</blockquote><p>Chúc bạn có những cuộc thảo luận hữu ích.</p>', 486, 38, false, true, 2, 28),
      ('Quy tắc đăng bài và văn hóa thảo luận', 'quy-tac-dang-bai-van-hoa-thao-luan', 'thong-bao-gnostica', 'ADMIN', 1,
       '<h3>Ba nguyên tắc quan trọng</h3><ol><li>Đặt tiêu đề rõ ràng và đúng chủ đề.</li><li>Không sao chép nội dung hoặc quảng cáo ngoài nền tảng.</li><li>Phản biện vào vấn đề, không công kích cá nhân.</li></ol><p>Bài vi phạm có thể bị ẩn hoặc khóa để kiểm duyệt.</p>', 312, 24, true, true, 2, 25),
      ('Lộ trình học lập trình web từ con số 0', 'lo-trinh-hoc-lap-trinh-web-tu-con-so-0', 'lap-trinh-cong-nghe', 'INSTRUCTOR', 1,
       '<h2>Một lộ trình thực tế trong 6 tháng</h2><p>Bắt đầu với HTML, CSS và JavaScript; sau đó chọn React hoặc Vue, học HTTP, API và một backend framework.</p><img src="https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg" alt="Minh họa lộ trình lập trình web" /><p>Điều quan trọng nhất là hoàn thành ít nhất ba dự án có thể trình diễn.</p>', 274, 19, false, false, 2, 23),
      ('Demo: tổ chức một dự án web dễ bảo trì', 'demo-to-chuc-du-an-web-de-bao-tri', 'lap-trinh-cong-nghe', 'INSTRUCTOR', 2,
       '<h2>Video minh họa</h2><p>Video dưới đây minh họa cách tổ chức nội dung và quy trình thực hành.</p><div class="aspect-video"><iframe src="https://iframe.mediadelivery.net/embed/655066/c63829f9-ad28-4567-a474-9988814a8899?autoplay=false&amp;loop=false&amp;muted=false&amp;preload=true" title="Demo tổ chức dự án web" loading="lazy" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><p>Sau khi xem, hãy thử tách dự án của bạn theo tính năng thay vì theo loại file.</p>', 221, 17, false, false, 2, 21),
      ('Checklist bảo mật cơ bản cho ứng dụng web', 'checklist-bao-mat-co-ban-ung-dung-web', 'lap-trinh-cong-nghe', 'INSTRUCTOR', 3,
       '<h2>Checklist trước khi triển khai</h2><ul><li>Kiểm tra phân quyền ở server.</li><li>Không lưu khóa bí mật ở frontend.</li><li>Validate dữ liệu đầu vào và giới hạn tốc độ.</li><li>Cập nhật dependency định kỳ.</li><li>Ghi log nhưng không ghi mật khẩu hoặc token.</li></ul>', 198, 14, false, false, 2, 19),
      ('AI Agent khác chatbot truyền thống như thế nào?', 'ai-agent-khac-chatbot-truyen-thong', 'du-lieu-tri-tue-nhan-tao', 'INSTRUCTOR', 4,
       '<h2>Khác biệt nằm ở khả năng hành động</h2><p>Chatbot chủ yếu phản hồi hội thoại. AI Agent có thể lập kế hoạch, chọn công cụ, quan sát kết quả và lặp lại cho tới khi hoàn thành mục tiêu.</p><img src="https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg" alt="Sơ đồ AI Agent" /><p>Tuy nhiên cần giới hạn quyền và luôn có bước xác nhận với hành động nhạy cảm.</p>', 365, 31, false, true, 2, 18),
      ('Trực quan hóa dữ liệu: chọn đúng biểu đồ', 'truc-quan-hoa-du-lieu-chon-dung-bieu-do', 'du-lieu-tri-tue-nhan-tao', 'INSTRUCTOR', 1,
       '<h2>Biểu đồ phục vụ câu hỏi, không phục vụ trang trí</h2><p>Dùng biểu đồ cột để so sánh, đường để xem xu hướng, scatter để tìm quan hệ và histogram để hiểu phân phối.</p><p>Hãy ghi rõ đơn vị, nguồn dữ liệu và tránh cắt trục gây hiểu nhầm.</p>', 143, 8, false, false, 2, 16),
      ('Case study: cải thiện màn hình đăng ký khóa học', 'case-study-cai-thien-man-hinh-dang-ky', 'thiet-ke-ui-ux-forum', 'INSTRUCTOR', 2,
       '<h2>Từ vấn đề đến prototype</h2><p>Nhóm quan sát người dùng bỏ dở ở bước nhập quá nhiều thông tin. Giải pháp là chia nhỏ biểu mẫu, giải thích lý do cần dữ liệu và lưu tiến trình.</p><img src="https://res.cloudinary.com/dhvlhfmlo/image/upload/v1784391722/gnostica_forum/1e1d149d5c9d8c1a13825a56d441324d65966f34104e21_d1f6b596-78b1-4c35-b4e0-a9614f378ab3.jpg" alt="Prototype màn hình đăng ký" /><p>Kết quả kiểm thử: thời gian hoàn thành giảm và tỷ lệ lỗi nhập liệu thấp hơn.</p>', 176, 12, false, false, 2, 14),
      ('Portfolio fresher nên có những gì?', 'portfolio-fresher-nen-co-nhung-gi', 'hoc-tap-phat-trien-nghe-nghiep', 'ADMIN', 1,
       '<h2>Chất lượng quan trọng hơn số lượng</h2><p>Mỗi dự án nên trình bày bối cảnh, vai trò, quyết định quan trọng, khó khăn và kết quả. Hai hoặc ba dự án hoàn chỉnh tốt hơn mười dự án sao chép.</p><p>Đừng quên liên kết mã nguồn, bản chạy thử và thông tin liên hệ.</p>', 289, 27, false, false, 2, 12),
      ('Làm sao duy trì thói quen học mỗi ngày?', 'lam-sao-duy-tri-thoi-quen-hoc-moi-ngay', 'hoc-tap-phat-trien-nghe-nghiep', 'INSTRUCTOR', 3,
       '<h2>Bắt đầu bằng mục tiêu đủ nhỏ</h2><p>Thay vì đặt mục tiêu học ba giờ, hãy cam kết 25 phút tập trung. Ghi lại điều đã học và một câu hỏi còn vướng sau mỗi phiên.</p><p>Sự đều đặn tạo ra kết quả lớn hơn những đợt học quá sức.</p>', 157, 11, false, false, 2, 10),
      ('Hỏi đáp: phân biệt authentication và authorization', 'hoi-dap-authentication-authorization', 'hoi-dap-cung-giang-vien', 'INSTRUCTOR', 1,
       '<h2>Authentication trả lời “bạn là ai?”</h2><p>Authorization trả lời “bạn được phép làm gì?”. Một hệ thống an toàn cần kiểm tra cả hai ở phía server trên mọi tài nguyên nhạy cảm.</p><p>Hãy để lại tình huống thực tế của bạn ở phần bình luận.</p>', 132, 7, false, false, 2, 8),
      ('Bản nháp: workshop tối ưu hiệu năng React', 'ban-nhap-workshop-toi-uu-react', 'lap-trinh-cong-nghe', 'INSTRUCTOR', 2,
       '<h2>Nội dung đang hoàn thiện</h2><p>Dự kiến gồm profiling, memoization, code splitting và đo Core Web Vitals trước/sau tối ưu.</p>', 0, 0, false, false, 1, 5),
      ('Bản nháp: tài nguyên tự học SQL', 'ban-nhap-tai-nguyen-tu-hoc-sql', 'du-lieu-tri-tue-nhan-tao', 'INSTRUCTOR', 4,
       '<p>Danh sách bài tập SELECT, JOIN, window function và tối ưu truy vấn đang được giảng viên biên soạn.</p>', 0, 0, false, false, 1, 4),
      ('Thông báo cũ đã ẩn', 'thong-bao-cu-da-an', 'thong-bao-gnostica', 'ADMIN', 1,
       '<p>Nội dung thông báo đã hết hiệu lực và được giữ lại để phục vụ quản trị.</p>', 41, 1, false, false, 0, 3),
      ('Bài đăng vi phạm quy định cộng đồng', 'bai-dang-vi-pham-quy-dinh-cong-dong', 'chu-de-noi-bo', 'INSTRUCTOR', 3,
       '<p>Nội dung mẫu phục vụ kiểm thử luồng kiểm duyệt và trạng thái vi phạm.</p>', 16, 0, true, false, 3, 2)
)
INSERT INTO threads(account_id, topic_id, title, slug, content, view_count, shared_count, is_locked, is_pinned, status, created_at, updated_at)
SELECT a.id, t.id, s.title, s.slug, s.content, s.views, s.shares, s.locked, s.pinned, s.status,
       CURRENT_TIMESTAMP - make_interval(days => s.days_ago), CURRENT_TIMESTAMP - make_interval(days => greatest(s.days_ago - 1, 0))
FROM thread_seed s
JOIN author_pool a ON a.role_name = s.author_role AND a.role_order = s.author_order
JOIN topics t ON t.slug = s.topic_slug
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, content = EXCLUDED.content, view_count = EXCLUDED.view_count,
    shared_count = EXCLUDED.shared_count, is_locked = EXCLUDED.is_locked,
    is_pinned = EXCLUDED.is_pinned, status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP,
    deleted_at = NULL;

INSERT INTO hashtags(name, usage_count, status, created_at)
VALUES ('gnostica', 0, 1, CURRENT_TIMESTAMP), ('laptrinhweb', 0, 1, CURRENT_TIMESTAMP),
       ('baomat', 0, 1, CURRENT_TIMESTAMP), ('ai', 0, 1, CURRENT_TIMESTAMP),
       ('dulieu', 0, 1, CURRENT_TIMESTAMP), ('uiux', 0, 1, CURRENT_TIMESTAMP),
       ('portfolio', 0, 1, CURRENT_TIMESTAMP), ('hoctap', 0, 1, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO UPDATE SET status = 1, deleted_at = NULL;

WITH mappings(thread_slug, hashtag_name) AS (
    VALUES
      ('chao-mung-cong-dong-gnostica', 'gnostica'),
      ('lo-trinh-hoc-lap-trinh-web-tu-con-so-0', 'laptrinhweb'),
      ('demo-to-chuc-du-an-web-de-bao-tri', 'laptrinhweb'),
      ('checklist-bao-mat-co-ban-ung-dung-web', 'baomat'),
      ('ai-agent-khac-chatbot-truyen-thong', 'ai'),
      ('truc-quan-hoa-du-lieu-chon-dung-bieu-do', 'dulieu'),
      ('case-study-cai-thien-man-hinh-dang-ky', 'uiux'),
      ('portfolio-fresher-nen-co-nhung-gi', 'portfolio'),
      ('lam-sao-duy-tri-thoi-quen-hoc-moi-ngay', 'hoctap')
)
INSERT INTO thread_hashtags(thread_id, hashtag_id, created_at)
SELECT t.id, h.id, CURRENT_TIMESTAMP FROM mappings m
JOIN threads t ON t.slug = m.thread_slug JOIN hashtags h ON h.name = m.hashtag_name
ON CONFLICT (thread_id, hashtag_id) DO NOTHING;

UPDATE hashtags h SET usage_count = (
    SELECT COUNT(*) FROM thread_hashtags th WHERE th.hashtag_id = h.id
) WHERE h.name IN ('gnostica','laptrinhweb','baomat','ai','dulieu','uiux','portfolio','hoctap');

WITH comment_seed(thread_slug, author_email, content, status, days_ago) AS (
    VALUES
      ('chao-mung-cong-dong-gnostica', 'lequocminh0365@gmail.com', '<p>Cảm ơn đội ngũ đã mở không gian trao đổi. Mình sẽ thường xuyên hỗ trợ các câu hỏi về dữ liệu.</p>', 1, 20),
      ('lo-trinh-hoc-lap-trinh-web-tu-con-so-0', 'dragonminhle909@gmail.com', '<p>Mình bổ sung: hãy học Git ngay từ dự án đầu tiên để hình thành thói quen làm việc nhóm.</p>', 1, 18),
      ('demo-to-chuc-du-an-web-de-bao-tri', 'playgamem20@gmail.com', '<p>Phần tách module theo tính năng rất thực tế. Có thể áp dụng tương tự cho backend không?</p>', 1, 17),
      ('checklist-bao-mat-co-ban-ung-dung-web', 'lequocminhcn@gmail.com', '<p>Nhắc thêm: mọi kiểm tra quyền ở giao diện đều phải được xác minh lại tại API.</p>', 1, 15),
      ('ai-agent-khac-chatbot-truyen-thong', 'lequocminh0365@gmail.com', '<p>Nên giới hạn ngân sách token và số vòng lặp để agent không chạy vô hạn.</p>', 1, 14),
      ('truc-quan-hoa-du-lieu-chon-dung-bieu-do', 'goslink.team@gmail.com', '<p>Một biểu đồ tốt cần giúp người xem trả lời câu hỏi trong vài giây.</p>', 1, 12),
      ('case-study-cai-thien-man-hinh-dang-ky', 'dragonminhle909@gmail.com', '<p>Case study trình bày rõ cả vấn đề, giả thuyết và kết quả kiểm thử.</p>', 1, 10),
      ('portfolio-fresher-nen-co-nhung-gi', 'playgamem20@gmail.com', '<p>Nhà tuyển dụng rất quan tâm cách bạn giải thích quyết định hơn là số framework đã dùng.</p>', 1, 8),
      ('lam-sao-duy-tri-thoi-quen-hoc-moi-ngay', 'lequocminh0365@gmail.com', '<p>Mình áp dụng phương pháp 25 phút và thấy dễ duy trì hơn nhiều.</p>', 1, 6),
      ('bai-dang-vi-pham-quy-dinh-cong-dong', 'lequocminhcn@gmail.com', '<p>Bình luận ẩn dùng để kiểm thử công cụ quản trị.</p>', 0, 1)
)
INSERT INTO comments(account_id, thread_id, content, status, created_at, updated_at)
SELECT a.id, t.id, s.content, s.status,
       CURRENT_TIMESTAMP - make_interval(days => s.days_ago), CURRENT_TIMESTAMP - make_interval(days => s.days_ago)
FROM comment_seed s JOIN accounts a ON a.email = s.author_email JOIN threads t ON t.slug = s.thread_slug
WHERE NOT EXISTS (
    SELECT 1 FROM comments c WHERE c.thread_id = t.id AND c.account_id = a.id AND c.content = s.content
);

WITH vote_seed(thread_slug, voter_email) AS (
    VALUES
      ('chao-mung-cong-dong-gnostica', 'lequocminh0365@gmail.com'),
      ('chao-mung-cong-dong-gnostica', 'dragonminhle909@gmail.com'),
      ('lo-trinh-hoc-lap-trinh-web-tu-con-so-0', 'playgamem20@gmail.com'),
      ('ai-agent-khac-chatbot-truyen-thong', 'lequocminh0365@gmail.com'),
      ('portfolio-fresher-nen-co-nhung-gi', 'goslink.team@gmail.com')
)
INSERT INTO votes(account_id, target_id, type, value, created_at, updated_at)
SELECT a.id, t.id::text, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM vote_seed s JOIN accounts a ON a.email = s.voter_email JOIN threads t ON t.slug = s.thread_slug
WHERE NOT EXISTS (
    SELECT 1 FROM votes v WHERE v.account_id = a.id AND v.target_id = t.id::text AND v.type = 1 AND v.deleted_at IS NULL
);

WITH report_seed(thread_slug, reporter_email, reason, description, status) AS (
    VALUES
      ('bai-dang-vi-pham-quy-dinh-cong-dong', 'lequocminh0365@gmail.com', 'Nội dung không phù hợp', '{"detail":"Bài viết dùng để kiểm thử luồng báo cáo vi phạm."}', 1),
      ('thong-bao-cu-da-an', 'dragonminhle909@gmail.com', 'Thông tin đã hết hiệu lực', '{"detail":"Đề nghị ẩn thông báo cũ khỏi danh sách công khai."}', 3),
      ('bai-dang-vi-pham-quy-dinh-cong-dong', 'playgamem20@gmail.com', 'Vi phạm quy tắc cộng đồng', '{"detail":"Báo cáo đã được kiểm tra và xử lý."}', 4)
)
INSERT INTO reports(account_id, target_id, target_type, reason, description, status, created_at, updated_at)
SELECT a.id, t.id::text, 'THREAD', s.reason, s.description::jsonb, s.status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM report_seed s JOIN accounts a ON a.email = s.reporter_email JOIN threads t ON t.slug = s.thread_slug
WHERE NOT EXISTS (
    SELECT 1 FROM reports r WHERE r.account_id = a.id AND r.target_id = t.id::text
      AND r.target_type = 'THREAD' AND r.reason = s.reason
);

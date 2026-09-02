-- Gnostica forum seed: realistic discussion activity for the topics created by seed_02.
-- Creates 5,000 threads, 6,370 topic members, 12,000 comments (including replies),
-- 20,500 votes, 300 reports, 70 hashtags and thread/hashtag links.
--
-- Prerequisites: seed_00_seed_journal.sql, seed_01_account_data.sql and
-- seed_02_category_topic_data.sql.  This seed is insert-only and can be undone
-- as one unit with undo_last_seed.sql.

BEGIN;

CREATE TEMP TABLE seed_context (run_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE seed_topics (id INT PRIMARY KEY, topic_no INT NOT NULL) ON COMMIT DROP;
CREATE TEMP TABLE seed_threads (id INT PRIMARY KEY, thread_no INT NOT NULL, status INT NOT NULL) ON COMMIT DROP;
CREATE TEMP TABLE seed_root_comments (id INT PRIMARY KEY, comment_no INT NOT NULL, target_id TEXT NOT NULL) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.unique_thread_slug(p_base TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v_suffix INT := 0; v_candidate TEXT := p_base;
BEGIN
  WHILE EXISTS (SELECT 1 FROM threads WHERE slug = v_candidate) LOOP
    v_suffix := v_suffix + 1; v_candidate := p_base || '-' || v_suffix;
  END LOOP;
  RETURN v_candidate;
END $$;

DO $$
BEGIN
  IF to_regclass('public.seed_runs') IS NULL OR to_regclass('public.seed_run_items') IS NULL THEN
    RAISE EXCEPTION 'Missing seed journal. Run seed_00_seed_journal.sql first.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM seed_runs WHERE seed_name = 'seed_02_category_topic_data.sql' AND status = 'COMPLETED') THEN
    RAISE EXCEPTION 'Missing completed category/topic seed. Run seed_02_category_topic_data.sql first.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM accounts a JOIN roles r ON r.id = a.role_id
    WHERE r.name IN ('USER', 'INSTRUCTOR') AND a.status = 1 AND a.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing active USER or INSTRUCTOR accounts.';
  END IF;
  IF EXISTS (SELECT 1 FROM seed_runs WHERE seed_name = 'seed_04_forum_thread_data.sql' AND status = 'COMPLETED') THEN
    RAISE EXCEPTION 'Forum thread seed already exists. Use undo_last_seed.sql before running it again.';
  END IF;
END $$;

WITH new_run AS (
  INSERT INTO seed_runs (id, seed_name, status, metadata, created_at)
  VALUES (gen_random_uuid(), 'seed_04_forum_thread_data.sql', 'RUNNING',
    jsonb_build_object('seed_batch', 'gnostica-forum-v1', 'expected_threads', 5000,
      'expected_members', 6370, 'expected_root_comments', 9000, 'expected_replies', 3000,
      'expected_votes', 20500, 'expected_reports', 300), NOW()) RETURNING id
) INSERT INTO seed_context SELECT id FROM new_run;

INSERT INTO seed_topics (id, topic_no)
SELECT t.id, row_number() OVER (ORDER BY t.id)::INT
FROM topics t
JOIN seed_run_items i ON i.record_id = t.id::TEXT AND i.table_name = 'topics'
JOIN seed_runs prior_run ON prior_run.id = i.run_id
  AND prior_run.seed_name = 'seed_02_category_topic_data.sql'
  AND prior_run.status = 'COMPLETED'
WHERE t.status = 1 AND t.deleted_at IS NULL;

DO $$ BEGIN
  IF (SELECT count(*) FROM seed_topics) <> 182 THEN
    RAISE EXCEPTION 'Expected 182 active topics from seed_02, found %.', (SELECT count(*) FROM seed_topics);
  END IF;
END $$;

-- A member is a real participant in a topic.  Every active topic gets 35 members.
WITH active_accounts AS (
  SELECT a.id, row_number() OVER (ORDER BY a.id)::INT AS account_no
  FROM accounts a JOIN roles r ON r.id = a.role_id
  WHERE r.name IN ('USER', 'INSTRUCTOR') AND a.status = 1 AND a.deleted_at IS NULL
), inserted AS (
  INSERT INTO members (account_id, topic_id, created_at)
  SELECT a.id, t.id, NOW() - ((t.topic_no * 19 + n * 7) % 720) * INTERVAL '1 day'
  FROM seed_topics t CROSS JOIN generate_series(1, 35) n
  JOIN active_accounts a ON a.account_no = ((t.topic_no * 29 + n * 17 - 1) % (SELECT count(*) FROM active_accounts)) + 1
  RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'members', i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

-- Hashtags reflect forum vocabulary; hidden tags deliberately remain unused as moderation edge cases.
WITH tag_data(name, status) AS (
  VALUES ('lap-trinh',1),('java',1),('spring-boot',1),('javascript',1),('reactjs',1),('python',1),('sql',1),('du-lieu',1),('tri-tue-nhan-tao',1),('machine-learning',1),
  ('thiet-ke',1),('ui-ux',1),('figma',1),('kinh-doanh',1),('khoi-nghiep',1),('marketing',1),('seo',1),('tai-chinh-ca-nhan',1),('dau-tu',1),('tieng-anh',1),
  ('giao-tiep',1),('ky-nang-mem',1),('quan-ly-thoi-gian',1),('phat-trien-ban-than',1),('suc-khoe',1),('giao-duc',1),('phap-luat',1),('du-lich',1),('am-thuc',1),('nhiep-anh',1),
  ('video',1),('khoa-hoc',1),('ky-thuat',1),('nong-nghiep',1),('van-hoa',1),('hoi-dap',1),('chia-se-kinh-nghiem',1),('lo-trinh-hoc',1),('tai-lieu',1),('thuc-hanh',1),
  ('du-an-ca-nhan',1),('phong-van',1),('nghe-nghiep',1),('cong-cu',1),('meo-hoc-tap',1),('thao-luan',1),('gop-y',1),('nguon-mo',1),('bao-mat',1),('cloud',1),
  ('devops',1),('mobile',1),('web-development',1),('data-analysis',1),('productivity',1),('freelance',1),('portfolio',1),('thuyet-trinh',1),('lam-viec-nhom',1),('tu-duy-phan-bien',1),
  ('noi-dung-can-kiem-duyet',0),('quang-cao',0),('lien-ket-ngoai',0),('tu-ngu-nhay-cam',0),('spam-nghi-ngo',0),('trung-lap',0),('luu-tru',0),('an-theo-yeu-cau',0),('kiem-tra-he-thong',0),('khong-su-dung',0)
), inserted AS (
  INSERT INTO hashtags (name, usage_count, status, created_at) SELECT name, 0, status, NOW() FROM tag_data RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'hashtags', i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

-- Titles and bodies come from coherent discussion prompts, then rotate by topic and participant.
WITH thread_specs AS (
  SELECT n AS thread_no, t.id AS topic_id,
    CASE WHEN n % 59 IN (0, 1) THEN 1 WHEN n % 97 = 0 THEN 0 WHEN n % 113 = 0 THEN 3 ELSE 2 END AS status,
    CASE (n % 20)
      WHEN 0 THEN 'Xin gợi ý lộ trình học từ cơ bản đến thực hành'
      WHEN 1 THEN 'Mọi người đang dùng tài liệu nào để tự học hiệu quả?'
      WHEN 2 THEN 'Chia sẻ cách tôi xử lý một bài tập khó'
      WHEN 3 THEN 'Cần góp ý cho kế hoạch học trong 8 tuần tới'
      WHEN 4 THEN 'Có nên học nền tảng trước khi dùng công cụ mới?'
      WHEN 5 THEN 'Kinh nghiệm duy trì động lực khi học mỗi ngày'
      WHEN 6 THEN 'Nhờ mọi người nhận xét sản phẩm đầu tay'
      WHEN 7 THEN 'Một vài lỗi người mới thường gặp và cách tránh'
      WHEN 8 THEN 'Nên ưu tiên kiến thức nào khi thời gian có hạn?'
      WHEN 9 THEN 'Tổng hợp nguồn tham khảo đáng tin cậy'
      WHEN 10 THEN 'Cách luyện tập để hiểu sâu thay vì học thuộc'
      WHEN 11 THEN 'Xin kinh nghiệm áp dụng kiến thức vào công việc'
      WHEN 12 THEN 'Thảo luận về tiêu chí đánh giá một dự án tốt'
      WHEN 13 THEN 'Mốc nào cho thấy tôi đã sẵn sàng học phần nâng cao?'
      WHEN 14 THEN 'Chia sẻ quy trình làm bài và tự kiểm tra kết quả'
      WHEN 15 THEN 'Có ai gặp vấn đề tương tự khi bắt đầu không?'
      WHEN 16 THEN 'Gợi ý cách ghi chú để ôn tập thuận tiện hơn'
      WHEN 17 THEN 'Đánh đổi giữa tốc độ học và chất lượng thực hành'
      WHEN 18 THEN 'Nhờ cộng đồng góp ý cho hướng giải quyết này'
      ELSE 'Điều tôi ước biết sớm hơn khi bắt đầu học'
    END AS title_base
  FROM generate_series(1, 5000) n JOIN seed_topics t ON t.topic_no = ((n - 1) % (SELECT count(*) FROM seed_topics)) + 1
), member_rank AS (
  SELECT m.account_id, m.topic_id, row_number() OVER (PARTITION BY m.topic_id ORDER BY m.id)::INT AS member_no
  FROM members m JOIN seed_context c ON EXISTS (SELECT 1 FROM seed_run_items i WHERE i.run_id=c.run_id AND i.table_name='members' AND i.record_id=m.id::TEXT)
), inserted AS (
  INSERT INTO threads (account_id, topic_id, title, slug, content, view_count, shared_count, is_locked, is_pinned, status, created_at, updated_at, deleted_at)
  SELECT mr.account_id, s.topic_id,
    left(s.title_base || ' — ' || (SELECT title FROM topics WHERE id=s.topic_id), 255),
    pg_temp.unique_thread_slug('thao-luan-' || s.topic_id || '-' || s.thread_no),
    '<p>Tôi đang học và thực hành theo chủ đề này. Mục tiêu của tôi là hiểu bản chất, có bài tập nhỏ để kiểm chứng, rồi áp dụng vào tình huống thực tế.</p><p>Mọi người có thể chia sẻ tài liệu, cách tiếp cận hoặc góp ý dựa trên trải nghiệm của mình không? Tôi sẽ cập nhật kết quả sau khi thử nghiệm.</p>' ||
    CASE
      -- About 11% of threads include one of the ten supplied Cloudinary images.
      WHEN s.thread_no % 9 = 0 THEN '<p><img src="' || (ARRAY[
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
      ])[1 + ((s.thread_no / 9)::INT % 10)] || '" alt="Hình minh họa cho nội dung thảo luận" loading="lazy" /></p>'
      -- About 6% include a playable Bunny video.  The IDs are the same ten IDs used by seed_03.
      WHEN s.thread_no % 17 = 0 THEN '<p>Video tham khảo:</p><iframe src="https://player.mediadelivery.net/embed/655066/' || (ARRAY[
        'b7cbeb53-ce23-4285-97cb-6421148aa852', 'b5f1240f-bbed-45ef-907c-f93d01527918',
        '375482c2-ed32-45ef-917d-7d4a2b9257d4', '6d5e092b-4063-4a92-b3dd-64ba28fd9679',
        '2b1af695-70df-431a-a3f2-ac6ba18e7c21', '65f234b3-aeeb-4720-bda9-14a41ade2802',
        '8e2ac859-60f3-44df-b2a5-f0dee76ba0c1', 'a4bf4b9f-fb44-41fc-a65a-2b035d5cf16a',
        'f0b22fcc-7055-455c-9568-3cc474c63aa5', '84c761de-744a-4342-87ae-d635e197d832'
      ])[1 + ((s.thread_no / 17)::INT % 10)] || '" title="Video tham khảo" loading="lazy" allowfullscreen="true" style="width:100%;aspect-ratio:16/9;border:0;"></iframe>'
      ELSE ''
    END,
    CASE WHEN s.status=2 THEN 12 + ((s.thread_no * 47) % 3800) ELSE ((s.thread_no * 7) % 60) END,
    CASE WHEN s.status=2 THEN (s.thread_no * 11) % 37 ELSE 0 END,
    CASE WHEN s.status=2 AND s.thread_no % 89=0 THEN true ELSE false END,
    CASE WHEN s.status=2 AND s.thread_no % 173=0 THEN true ELSE false END,
    s.status,
    CASE WHEN s.status=3 THEN NOW()-((s.thread_no%20)+1)*INTERVAL '1 hour' ELSE NOW()-((s.thread_no*13)%900)*INTERVAL '1 day' END,
    CASE WHEN s.status=3 THEN NOW()-((s.thread_no%20)+1)*INTERVAL '1 hour' ELSE NOW()-((s.thread_no*13)%900)*INTERVAL '1 day' + ((s.thread_no%18)+1)*INTERVAL '1 hour' END,
    CASE WHEN s.status=0 AND s.thread_no%2=0 THEN NOW()-((s.thread_no*13)%900)*INTERVAL '1 day' ELSE NULL END
  FROM thread_specs s JOIN member_rank mr ON mr.topic_id=s.topic_id AND mr.member_no=((s.thread_no*11-1)%35)+1
  RETURNING id, status
)
INSERT INTO seed_threads SELECT id, row_number() OVER (ORDER BY id)::INT, status FROM inserted;

INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'threads', t.id::TEXT FROM seed_threads t CROSS JOIN seed_context c;

-- Each published thread receives one to three distinct active hashtags.
WITH active_tags AS (
  SELECT h.id, row_number() OVER (ORDER BY h.id)::INT AS tag_no FROM hashtags h
  JOIN seed_context c ON EXISTS (SELECT 1 FROM seed_run_items i WHERE i.run_id=c.run_id AND i.table_name='hashtags' AND i.record_id=h.id::TEXT)
  WHERE h.status=1
), inserted AS (
  INSERT INTO thread_hashtags (thread_id, hashtag_id, created_at)
  SELECT t.id, h.id, NOW()-((t.thread_no*5)%720)*INTERVAL '1 day'
  FROM seed_threads t CROSS JOIN LATERAL generate_series(1, 1+(t.thread_no%3)) k
  JOIN active_tags h ON h.tag_no=((t.thread_no+k*13-1)%60)+1 WHERE t.status=2
  RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'thread_hashtags', i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

UPDATE hashtags h SET usage_count = x.total
FROM (SELECT th.hashtag_id, count(*)::INT total FROM thread_hashtags th JOIN seed_context c ON EXISTS (SELECT 1 FROM seed_run_items i WHERE i.run_id=c.run_id AND i.table_name='thread_hashtags' AND i.record_id=th.id::TEXT) GROUP BY th.hashtag_id) x
WHERE h.id=x.hashtag_id;

-- Comments are only on published and unlocked discussions.  Three thousand are replies to a real root comment.
WITH public_threads AS (SELECT id, row_number() OVER (ORDER BY id)::INT AS thread_no FROM seed_threads WHERE status=2), active_accounts AS (
  SELECT a.id, row_number() OVER (ORDER BY a.id)::INT account_no FROM accounts a JOIN roles r ON r.id=a.role_id WHERE r.name IN ('USER','INSTRUCTOR') AND a.status=1 AND a.deleted_at IS NULL
), inserted AS (
  INSERT INTO comments (account_id, target_type, target_id, parent_id, mention_id, content, status, created_at, updated_at)
  SELECT a.id, 'THREAD', p.id::TEXT, NULL, NULL,
    CASE n%6 WHEN 0 THEN 'Cảm ơn bạn đã nêu vấn đề rõ ràng. Tôi thấy nên bắt đầu bằng một bài tập nhỏ và ghi lại điều chưa hiểu.' WHEN 1 THEN 'Tôi từng gặp tình huống này. Cách hiệu quả nhất với tôi là chia mục tiêu thành từng tuần và tự đánh giá sau mỗi buổi học.' WHEN 2 THEN 'Bạn có thể bổ sung ví dụ cụ thể không? Khi có đầu vào thực tế thì mọi người sẽ góp ý chính xác hơn.' WHEN 3 THEN 'Góc nhìn của bạn rất hữu ích. Tôi sẽ thử áp dụng theo hướng này trong tuần tới.' WHEN 4 THEN 'Theo kinh nghiệm của tôi, nên ưu tiên nền tảng rồi mới tối ưu công cụ. Như vậy sẽ ít bị phụ thuộc hơn.' ELSE 'Tài liệu bạn nhắc tới khá phù hợp cho người mới. Tôi bổ sung thêm: hãy làm lại bài tập sau vài ngày để kiểm tra mức độ hiểu.' END,
    CASE WHEN n%43=0 THEN 0 ELSE 1 END, NOW()-((n*7)%850)*INTERVAL '1 day', NOW()-((n*7)%850)*INTERVAL '1 day' + (n%9)*INTERVAL '1 hour'
  FROM generate_series(1,9000) n JOIN public_threads p ON p.thread_no=((n-1)%(SELECT count(*) FROM public_threads))+1
  JOIN active_accounts a ON a.account_no=((n*31-1)%(SELECT count(*) FROM active_accounts))+1
  RETURNING id, target_id
)
INSERT INTO seed_root_comments SELECT id, row_number() OVER (ORDER BY id)::INT, target_id FROM inserted;

INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'comments', r.id::TEXT FROM seed_root_comments r CROSS JOIN seed_context c;

WITH active_accounts AS (
  SELECT a.id, row_number() OVER (ORDER BY a.id)::INT account_no FROM accounts a JOIN roles r ON r.id=a.role_id WHERE r.name IN ('USER','INSTRUCTOR') AND a.status=1 AND a.deleted_at IS NULL
), inserted AS (
  INSERT INTO comments (account_id, target_type, target_id, parent_id, mention_id, content, status, created_at, updated_at)
  SELECT a.id, 'THREAD', r.target_id, r.id,
    CASE WHEN n%4=0 THEN parent.account_id ELSE NULL END,
    CASE n%4 WHEN 0 THEN 'Tôi đồng ý với ý này. Cảm ơn bạn đã giải thích chi tiết, phần ví dụ giúp tôi hình dung rõ hơn.' WHEN 1 THEN 'Bạn có thể cho biết kết quả sau khi thử không? Tôi cũng đang cân nhắc cách làm tương tự.' WHEN 2 THEN 'Ý kiến này hợp lý, nhất là khi mới bắt đầu. Tôi sẽ lưu lại để áp dụng vào bài tập của mình.' ELSE 'Tôi xin bổ sung một điểm nhỏ: nên kiểm tra lại giả định ban đầu trước khi kết luận.' END,
    CASE WHEN n%67=0 THEN 0 ELSE 1 END, NOW()-((n*11)%800)*INTERVAL '1 day', NOW()-((n*11)%800)*INTERVAL '1 day' + (n%7)*INTERVAL '1 hour'
  FROM generate_series(1,3000) n JOIN seed_root_comments r ON r.comment_no=((n*7-1)%9000)+1
  JOIN comments parent ON parent.id=r.id JOIN active_accounts a ON a.account_no=((n*19-1)%(SELECT count(*) FROM active_accounts))+1
  RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT c.run_id, 'comments', i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

-- The API treats type 1 as a like and type 2 as one up/down vote.  Pair generation is unique for each type.
WITH public_threads AS (SELECT id, row_number() OVER (ORDER BY id)::INT thread_no FROM seed_threads WHERE status=2), active_accounts AS (
  SELECT a.id, row_number() OVER (ORDER BY a.id)::INT account_no FROM accounts a JOIN roles r ON r.id=a.role_id WHERE r.name IN ('USER','INSTRUCTOR') AND a.status=1 AND a.deleted_at IS NULL
), inserted AS (
  INSERT INTO votes (account_id, target_id, target_type, type, value, created_at, updated_at)
  SELECT a.id, t.id::TEXT, 'THREAD', 1, true, NOW()-((n*3)%820)*INTERVAL '1 day', NOW()-((n*3)%820)*INTERVAL '1 day'
  FROM generate_series(1,8500) n JOIN public_threads t ON t.thread_no=((n*13-1)%(SELECT count(*) FROM public_threads))+1
  JOIN active_accounts a ON a.account_no=((n*37-1)%(SELECT count(*) FROM active_accounts))+1 RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id) SELECT c.run_id,'votes',i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

WITH public_threads AS (SELECT id, row_number() OVER (ORDER BY id)::INT thread_no FROM seed_threads WHERE status=2), active_accounts AS (
  SELECT a.id, row_number() OVER (ORDER BY a.id)::INT account_no FROM accounts a JOIN roles r ON r.id=a.role_id WHERE r.name IN ('USER','INSTRUCTOR') AND a.status=1 AND a.deleted_at IS NULL
), inserted AS (
  INSERT INTO votes (account_id, target_id, target_type, type, value, created_at, updated_at)
  SELECT a.id, t.id::TEXT, 'THREAD', 2, CASE WHEN n%9=0 THEN false ELSE true END, NOW()-((n*5)%820)*INTERVAL '1 day', NOW()-((n*5)%820)*INTERVAL '1 day'
  FROM generate_series(1,12000) n JOIN public_threads t ON t.thread_no=((n*17-1)%(SELECT count(*) FROM public_threads))+1
  JOIN active_accounts a ON a.account_no=((n*41-1)%(SELECT count(*) FROM active_accounts))+1 RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id) SELECT c.run_id,'votes',i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

WITH public_threads AS (SELECT id, row_number() OVER (ORDER BY id)::INT thread_no FROM seed_threads WHERE status=2), active_accounts AS (
  SELECT a.id, row_number() OVER (ORDER BY a.id)::INT account_no FROM accounts a JOIN roles r ON r.id=a.role_id WHERE r.name IN ('USER','INSTRUCTOR') AND a.status=1 AND a.deleted_at IS NULL
), inserted AS (
  INSERT INTO reports (account_id, target_id, target_type, reason, description, status, created_at, updated_at)
  SELECT a.id,t.id::TEXT,'THREAD', (ARRAY['SPAM','HARASSMENT','MISINFORMATION','COPYRIGHT','OTHER'])[(n%5)+1],
    jsonb_build_object('note', CASE WHEN n%3=0 THEN 'Cần kiểm tra lại nội dung theo quy định cộng đồng.' WHEN n%3=1 THEN 'Người dùng gửi báo cáo để đội ngũ xem xét.' ELSE 'Đã bổ sung ngữ cảnh cần thiết cho việc xử lý.' END),
    CASE WHEN n%7=0 THEN 1 WHEN n%5=0 THEN 2 WHEN n%3=0 THEN 3 ELSE 4 END,
    NOW()-((n*17)%700)*INTERVAL '1 day', NOW()-((n*17)%700)*INTERVAL '1 day' + (n%10)*INTERVAL '1 hour'
  FROM generate_series(1,300) n JOIN public_threads t ON t.thread_no=((n*23-1)%(SELECT count(*) FROM public_threads))+1
  JOIN active_accounts a ON a.account_no=((n*47-1)%(SELECT count(*) FROM active_accounts))+1 RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id) SELECT c.run_id,'reports',i.id::TEXT FROM inserted i CROSS JOIN seed_context c;

DO $$
DECLARE v_threads INT; v_members INT; v_comments INT; v_votes INT; v_reports INT; v_bad INT;
BEGIN
  SELECT count(*) INTO v_threads FROM seed_run_items WHERE run_id=(SELECT run_id FROM seed_context) AND table_name='threads';
  SELECT count(*) INTO v_members FROM seed_run_items WHERE run_id=(SELECT run_id FROM seed_context) AND table_name='members';
  SELECT count(*) INTO v_comments FROM seed_run_items WHERE run_id=(SELECT run_id FROM seed_context) AND table_name='comments';
  SELECT count(*) INTO v_votes FROM seed_run_items WHERE run_id=(SELECT run_id FROM seed_context) AND table_name='votes';
  SELECT count(*) INTO v_reports FROM seed_run_items WHERE run_id=(SELECT run_id FROM seed_context) AND table_name='reports';
  IF v_threads<>5000 OR v_members<>6370 OR v_comments<>12000 OR v_votes<>20500 OR v_reports<>300 THEN RAISE EXCEPTION 'Unexpected forum seed counts: threads %, members %, comments %, votes %, reports %.',v_threads,v_members,v_comments,v_votes,v_reports; END IF;
  SELECT count(*) INTO v_bad FROM (
    SELECT r.target_id, r.account_id
    FROM reports r JOIN seed_context c ON EXISTS (SELECT 1 FROM seed_run_items i WHERE i.run_id=c.run_id AND i.table_name='reports' AND i.record_id=r.id::TEXT)
    GROUP BY r.target_id, r.account_id HAVING count(*) > 1
  ) duplicate_reports;
  IF v_bad <> 0 THEN RAISE EXCEPTION 'Duplicate report pair generated.'; END IF;
END $$;

UPDATE seed_runs SET status='COMPLETED', completed_at=NOW(), metadata=metadata || jsonb_build_object('actual_threads',5000,'actual_members',6370,'actual_comments',12000,'actual_votes',20500,'actual_reports',300)
WHERE id=(SELECT run_id FROM seed_context);

COMMIT;

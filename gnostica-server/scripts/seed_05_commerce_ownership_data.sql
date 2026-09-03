-- Gnostica commerce and course-ownership seed.
--
-- Creates a realistic, internally consistent purchase history for the catalog
-- produced by seed_01 through seed_03. Learning progress, favourites and
-- reviews deliberately belong to later seed files.
--
-- Scale: 25,000 orders / details / payments; 20,000 enrollments and wallet
-- records; 400 payouts; 35,000 notifications; 17,500 logs.
--
-- Prerequisites:
--   1. seed_00_seed_journal.sql
--   2. seed_01_account_data.sql
--   3. seed_02_category_topic_data.sql
--   4. seed_03_course_learning_data.sql
--   5. At least one active bank record (normally supplied by bank synchronisation).
--
-- The seed is insert-only and can be reverted with undo_last_seed.sql.

BEGIN;

CREATE TEMP TABLE seed_context (
    run_id UUID PRIMARY KEY
) ON COMMIT DROP;

DO $$
BEGIN
    IF to_regclass('public.seed_runs') IS NULL OR to_regclass('public.seed_run_items') IS NULL THEN
        RAISE EXCEPTION 'Missing seed journal. Run seed_00_seed_journal.sql before this script.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM seed_runs
        WHERE seed_name = 'seed_05_commerce_ownership_data.sql' AND status = 'COMPLETED'
    ) THEN
        RAISE EXCEPTION 'Commerce seed already exists. Run undo_last_seed.sql before running it again.';
    END IF;

    IF (SELECT count(*) FROM accounts a JOIN roles r ON r.id = a.role_id
        WHERE a.metadata ->> 'seed_batch' = 'gnostica-account-v1'
          AND r.name = 'USER' AND a.status = 1 AND a.deleted_at IS NULL) < 800 THEN
        RAISE EXCEPTION 'Expected at least 800 active seeded USER accounts.';
    END IF;

    IF (SELECT count(*) FROM accounts a JOIN roles r ON r.id = a.role_id
        WHERE a.metadata ->> 'seed_batch' = 'gnostica-account-v1'
          AND r.name = 'INSTRUCTOR' AND a.status = 1 AND a.deleted_at IS NULL) < 40 THEN
        RAISE EXCEPTION 'Expected at least 40 active seeded INSTRUCTOR accounts.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM banks WHERE status = 1 AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'Missing active bank. Synchronise banks before running this commerce seed.';
    END IF;
END $$;

WITH new_run AS (
    INSERT INTO seed_runs (id, seed_name, status, metadata, created_at)
    VALUES (
        gen_random_uuid(),
        'seed_05_commerce_ownership_data.sql',
        'RUNNING',
        jsonb_build_object(
            'seed_batch', 'gnostica-commerce-v1',
            'orders', 25000, 'payouts', 400,
            'learning_progress_included', false
        ),
        NOW()
    )
    RETURNING id
)
INSERT INTO seed_context (run_id)
SELECT id FROM new_run;

-- Only sell courses that are visible and owned by an active seeded instructor.
CREATE TEMP TABLE seed_buyers ON COMMIT DROP AS
SELECT a.id AS account_id,
       row_number() OVER (ORDER BY md5(a.id::TEXT))::INT AS buyer_no
FROM accounts a
JOIN roles r ON r.id = a.role_id
WHERE a.metadata ->> 'seed_batch' = 'gnostica-account-v1'
  AND r.name = 'USER' AND a.status = 1 AND a.deleted_at IS NULL
ORDER BY md5(a.id::TEXT)
LIMIT 800;

CREATE TEMP TABLE seed_instructors ON COMMIT DROP AS
SELECT a.id AS account_id,
       row_number() OVER (ORDER BY md5(a.id::TEXT))::INT AS instructor_no
FROM accounts a
JOIN roles r ON r.id = a.role_id
WHERE a.metadata ->> 'seed_batch' = 'gnostica-account-v1'
  AND r.name = 'INSTRUCTOR' AND a.status = 1 AND a.deleted_at IS NULL
ORDER BY md5(a.id::TEXT)
LIMIT 40;

CREATE TEMP TABLE seed_sellable_courses ON COMMIT DROP AS
SELECT c.id AS course_id, c.account_id AS instructor_id, c.price, c.discount,
       row_number() OVER (ORDER BY md5(c.id::TEXT))::INT AS course_no
FROM courses c
JOIN seed_instructors i ON i.account_id = c.account_id
JOIN categories category ON category.id = c.category_id
WHERE c.metadata ->> 'seed_batch' = 'gnostica-course-v1'
  AND c.status = 1 AND c.deleted_at IS NULL
  AND category.status = 1 AND category.deleted_at IS NULL;

DO $$
BEGIN
    IF (SELECT count(*) FROM seed_sellable_courses) < 100 THEN
        RAISE EXCEPTION 'Expected at least 100 sellable seeded courses, found %.',
            (SELECT count(*) FROM seed_sellable_courses);
    END IF;
    IF (SELECT count(DISTINCT instructor_id) FROM seed_sellable_courses) < 40 THEN
        RAISE EXCEPTION 'Expected every active seeded instructor to own a sellable course.';
    END IF;
END $$;

-- A skewed activity model: 10%% power users, 35%% regular users, and a long tail.
CREATE TEMP TABLE seed_buyer_cohorts ON COMMIT DROP AS
SELECT account_id,
       CASE
           WHEN buyer_no <= 80 THEN 90
           WHEN buyer_no <= 360 THEN 45
           WHEN buyer_no <= 760 THEN 13
           ELSE 2
       END AS planned_purchases
FROM seed_buyers;

CREATE TEMP TABLE seed_purchase_candidates ON COMMIT DROP AS
SELECT cohort.account_id, course.course_id, course.instructor_id, course.price, course.discount,
       cohort.planned_purchases,
       row_number() OVER (
           PARTITION BY cohort.account_id
           ORDER BY md5(cohort.account_id::TEXT || ':' || course.course_id::TEXT)
       )::INT AS course_rank,
       md5(course.course_id::TEXT || ':' || cohort.account_id::TEXT) AS pair_sort
FROM seed_buyer_cohorts cohort
CROSS JOIN seed_sellable_courses course;

-- Retrieve the default active commission created by V1 migration
CREATE TEMP TABLE seed_commissions ON COMMIT DROP AS
SELECT c.id AS commission_id,
       c.instructor_ratio, c.platform_ratio
FROM commissions c
WHERE c.status = 1
ORDER BY c.created_at DESC LIMIT 1;

-- Pick unique account/course pairs. The total cohort capacity is 25,080; the
-- final limit makes exactly 25,000 orders without duplicate enrollments.
CREATE TEMP TABLE seed_purchase_plan ON COMMIT DROP AS
WITH selected_pairs AS (
    SELECT *
    FROM seed_purchase_candidates
    WHERE course_rank <= planned_purchases
    ORDER BY pair_sort
    LIMIT 25000
), numbered AS (
    SELECT row_number() OVER (ORDER BY pair_sort)::INT AS purchase_no, *
    FROM selected_pairs
), classified AS (
    SELECT numbered.*,
           CASE
               WHEN purchase_no <= 17500 THEN 1
               WHEN purchase_no <= 19500 THEN 0
               WHEN purchase_no <= 22500 THEN -1
               ELSE 2
           END AS order_status,
           1 + ((purchase_no * 7) % 12) AS commission_slot
    FROM numbered
), priced AS (
    SELECT classified.*,
           round(classified.price * (100 - COALESCE(classified.discount, 0)) / 100, 6) AS gross_price
    FROM classified
)
SELECT purchase_no,
       gen_random_uuid() AS order_id,
       gen_random_uuid() AS order_detail_id,
       gen_random_uuid() AS payment_id,
       account_id, course_id, instructor_id,
       NULL::UUID AS coupon_id,
       order_status, COALESCE(discount, 0) AS course_discount,
       gross_price, gross_price AS final_price,
       (NOW() - INTERVAL '800 days'
           + (commission_slot * 60) * INTERVAL '1 day'
           + ((purchase_no * 19) % 45) * INTERVAL '1 day'
           + ((purchase_no * 13) % 18) * INTERVAL '1 hour')::TIMESTAMP AS created_at
FROM priced;

WITH inserted AS (
    INSERT INTO orders (
        id, account_id, coupon_id, total_price, payment_method, order_code,
        status, created_at, updated_at
    )
    SELECT order_id, account_id, coupon_id, final_price,
           CASE WHEN purchase_no % 4 = 0 THEN 'VNPAY' ELSE 'PAYOS' END,
           840000000000::BIGINT + purchase_no,
           order_status, created_at, created_at + INTERVAL '5 minutes'
    FROM seed_purchase_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'orders', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

WITH inserted AS (
    INSERT INTO order_details (
        id, order_id, course_id, commission_id, price, discount, status, created_at, updated_at
    )
    SELECT plan.order_detail_id, plan.order_id, plan.course_id, commission.commission_id,
           plan.final_price, plan.course_discount,
           CASE WHEN plan.order_status = 2 THEN 0 ELSE 1 END,
           plan.created_at, plan.created_at + INTERVAL '5 minutes'
    FROM seed_purchase_plan plan
    CROSS JOIN seed_commissions commission
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'order_details', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

WITH inserted AS (
    INSERT INTO payments (
        id, order_id, payment_code, amount, gateway, gateway_transaction_no,
        paid_at, payload, status, created_at, updated_at
    )
    SELECT payment_id, order_id, (840000000000::BIGINT + purchase_no)::text, final_price,
           CASE WHEN purchase_no % 4 = 0 THEN 'VNPAY' ELSE 'PAYOS' END,
           'SEED-GW-' || lpad(purchase_no::TEXT, 6, '0'),
           CASE WHEN order_status IN (1, 2) THEN created_at + INTERVAL '15 minutes' ELSE NULL END,
           jsonb_build_object('seed_batch', 'gnostica-commerce-v1', 'purchase_no', purchase_no,
                              'simulated_status', CASE order_status WHEN 1 THEN 'PAID' WHEN 0 THEN 'PENDING'
                                                       WHEN -1 THEN 'FAILED' ELSE 'REFUNDED' END),
           CASE order_status WHEN 1 THEN 2 WHEN 0 THEN 1 WHEN -1 THEN 3 ELSE 4 END,
           created_at + INTERVAL '10 minutes', created_at + INTERVAL '15 minutes'
    FROM seed_purchase_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'payments', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

-- An enrollment is created only after a successful payment. Refunded orders
-- retain an enrollment as a dropped record, matching the historical ownership.
WITH inserted AS (
    INSERT INTO enrollments (
        account_id, course_id, order_detail_id, progress, certificate_url,
        status, created_at, completed_at
    )
    SELECT account_id, course_id, order_detail_id, 0, NULL,
           CASE WHEN order_status = 1 THEN 1 ELSE 0 END,
           created_at + INTERVAL '16 minutes', NULL
    FROM seed_purchase_plan
    WHERE order_status IN (1, 2)
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'enrollments', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

WITH inserted AS (
    INSERT INTO refunds (
        id, order_detail_id, account_id, amount, reason, status, created_at, updated_at
    )
    SELECT gen_random_uuid(), order_detail_id, account_id, final_price,
           (ARRAY['Người học đổi kế hoạch học tập', 'Nội dung chưa phù hợp nhu cầu', 'Thanh toán bị xử lý nhầm'])[1 + (purchase_no % 3)],
           2, created_at + INTERVAL '10 days', created_at + INTERVAL '10 days'
    FROM seed_purchase_plan
    WHERE order_status = 2
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'refunds', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

CREATE TEMP TABLE seed_wallet_plan ON COMMIT DROP AS
SELECT gen_random_uuid() AS wallet_id, plan.*, commission.instructor_ratio,
       round(plan.gross_price * commission.instructor_ratio / 100, 6) AS instructor_amount,
       CASE WHEN plan.order_status = 1 THEN 1 ELSE 0 END AS wallet_status
FROM seed_purchase_plan plan
CROSS JOIN seed_commissions commission
WHERE plan.order_status IN (1, 2);

WITH inserted AS (
    INSERT INTO wallets (
        id, account_id, remain, type, status, created_at, available_at, target_type, target_id
    )
    SELECT wallet_id, instructor_id, instructor_amount, 1, wallet_status,
           created_at + INTERVAL '16 minutes', created_at + INTERVAL '14 days 16 minutes',
           'ORDER_DETAIL', order_detail_id
    FROM seed_wallet_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'wallets', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

-- One active bank account per instructor with revenue. Bank records themselves
-- are not created because they are synchronised reference data.
CREATE TEMP TABLE seed_account_bank_plan ON COMMIT DROP AS
SELECT gen_random_uuid() AS account_bank_id, instructor.account_id,
       (SELECT bank.id FROM banks bank WHERE bank.status = 1 AND bank.deleted_at IS NULL
        ORDER BY md5(bank.id::TEXT || ':' || instructor.account_id::TEXT) LIMIT 1) AS bank_id,
       '0' || lpad(((instructor.instructor_no * 7919 + 123457) % 1000000000)::TEXT, 9, '0') AS account_number,
       instructor.instructor_no
FROM seed_instructors instructor
WHERE EXISTS (SELECT 1 FROM seed_wallet_plan wallet WHERE wallet.instructor_id = instructor.account_id);

WITH inserted AS (
    INSERT INTO account_banks (
        id, account_id, bank_id, account_number, pin, status, created_at, updated_at, deleted_at
    )
    SELECT account_bank_id, account_id, bank_id, account_number,
           '$2a$10$uGpaulAkhzbHAcq27oVmU.aqWiuG92JiafGA8uDnvGxjX8s0OwAy6', -- PIN: 123456
           1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NULL
    FROM seed_account_bank_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'account_banks', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

CREATE TEMP TABLE seed_payout_plan ON COMMIT DROP AS
WITH revenue AS (
    SELECT instructor_id AS account_id, sum(instructor_amount) AS total_revenue
    FROM seed_wallet_plan
    WHERE wallet_status = 1
    GROUP BY instructor_id
)
SELECT gen_random_uuid() AS payout_id, bank.account_id, bank.account_bank_id,
       round(revenue.total_revenue / 100, 6) AS amount,
       CASE WHEN sequence_no <= 6 THEN 3 WHEN sequence_no = 7 THEN 2
            WHEN sequence_no = 8 THEN 1 WHEN sequence_no = 9 THEN 4 ELSE 5 END AS status,
       NOW() - (sequence_no * INTERVAL '1 day') AS created_at,
       'SEED-PO-' || to_char(NOW() - (sequence_no * INTERVAL '1 day'), 'YYYYMMDD') || '-' || lpad((bank.instructor_no * 10 + sequence_no)::text, 4, '0') AS payout_code,
       0 AS submission_attempts,
       '{}'::jsonb AS metadata
FROM seed_account_bank_plan bank
JOIN revenue ON revenue.account_id = bank.account_id
CROSS JOIN generate_series(1, 10) AS sequence_no;

WITH inserted AS (
    INSERT INTO payouts (id, account_id, account_bank_id, amount, status, payout_code, submission_attempts, metadata, created_at, updated_at)
    SELECT payout_id, account_id, account_bank_id, amount, status, payout_code, submission_attempts, metadata, created_at, created_at + INTERVAL '5 minutes'
    FROM seed_payout_plan
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'payouts', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

WITH inserted AS (
    INSERT INTO logs (account_id, action, payload, created_at)
    SELECT instructor_id, 'REVENUE_ADDED',
           jsonb_build_object('seed_batch', 'gnostica-commerce-v1', 'order_id', order_id,
                              'course_id', course_id, 'instructor_amount', instructor_amount,
                              'gross_amount', gross_price, 'net_sale_amount', final_price,
                              'coupon_cost_bearer', CASE WHEN coupon_id IS NULL THEN 'NONE' ELSE 'PLATFORM' END),
           created_at + INTERVAL '16 minutes'
    FROM seed_wallet_plan
    WHERE wallet_status = 1
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'logs', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

WITH inserted AS (
    INSERT INTO notifications (account_id, title, message, is_read, type, reference_id, created_at, updated_at)
    SELECT account_id, 'Đăng ký khóa học thành công',
           'Bạn đã đăng ký thành công một khóa học. Chúc bạn học tập hiệu quả!',
           purchase_no % 4 = 0, 'ENROLLMENT', order_id::TEXT,
           created_at + INTERVAL '16 minutes', created_at + INTERVAL '16 minutes'
    FROM seed_purchase_plan
    WHERE order_status = 1
    UNION ALL
    SELECT instructor_id, 'Có học viên mới',
           'Một học viên vừa mua khóa học của bạn.',
           purchase_no % 5 = 0, 'SYSTEM', order_id::TEXT,
           created_at + INTERVAL '16 minutes', created_at + INTERVAL '16 minutes'
    FROM seed_purchase_plan
    WHERE order_status = 1
    RETURNING id
)
INSERT INTO seed_run_items (run_id, table_name, record_id)
SELECT context.run_id, 'notifications', inserted.id::TEXT
FROM inserted CROSS JOIN seed_context context;

-- Hard validation before the transaction becomes visible.
DO $$
DECLARE
    v_orders INT;
    v_details INT;
    v_payments INT;
    v_enrollments INT;
    v_wallets INT;
    v_payouts INT;
    v_commissions INT;
    v_banks INT;
    v_refunds INT;
    v_logs INT;
    v_notifications INT;
BEGIN
    SELECT count(*) INTO v_orders FROM seed_purchase_plan;
    SELECT count(*) INTO v_details FROM order_details detail JOIN seed_context context ON true
      JOIN seed_run_items item ON item.run_id = context.run_id AND item.table_name = 'order_details' AND item.record_id = detail.id::TEXT;
    SELECT count(*) INTO v_payments FROM payments payment JOIN seed_context context ON true
      JOIN seed_run_items item ON item.run_id = context.run_id AND item.table_name = 'payments' AND item.record_id = payment.id::TEXT;
    SELECT count(*) INTO v_enrollments FROM seed_run_items item JOIN seed_context context ON context.run_id = item.run_id WHERE item.table_name = 'enrollments';
    SELECT count(*) INTO v_wallets FROM seed_wallet_plan;
    SELECT count(*) INTO v_payouts FROM seed_payout_plan;
    SELECT count(*) INTO v_banks FROM seed_run_items item JOIN seed_context context ON context.run_id = item.run_id WHERE item.table_name = 'account_banks';
    SELECT count(*) INTO v_refunds FROM seed_run_items item JOIN seed_context context ON context.run_id = item.run_id WHERE item.table_name = 'refunds';
    SELECT count(*) INTO v_logs FROM seed_run_items item JOIN seed_context context ON context.run_id = item.run_id WHERE item.table_name = 'logs';
    SELECT count(*) INTO v_notifications FROM seed_run_items item JOIN seed_context context ON context.run_id = item.run_id WHERE item.table_name = 'notifications';

    IF v_orders <> 25000 OR v_details <> 25000 OR v_payments <> 25000
       OR v_enrollments <> 20000 OR v_wallets <> 20000 OR v_payouts <> 400
       OR v_banks <> 40
       OR v_refunds <> 2500 OR v_logs <> 17500 OR v_notifications <> 35000 THEN
        RAISE EXCEPTION 'Unexpected commerce counts: orders %, details %, payments %, enrollments %, wallets %, payouts %, banks %, refunds %, logs %, notifications %.',
            v_orders, v_details, v_payments, v_enrollments, v_wallets, v_payouts,
            v_banks, v_refunds, v_logs, v_notifications;
    END IF;

    IF EXISTS (
        SELECT 1 FROM seed_purchase_plan GROUP BY account_id, course_id HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Purchase plan contains duplicate account/course pairs.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM seed_purchase_plan plan
        JOIN orders ord ON ord.id = plan.order_id
        JOIN order_details detail ON detail.id = plan.order_detail_id
        JOIN payments payment ON payment.id = plan.payment_id
        WHERE ord.total_price <> detail.price OR ord.total_price <> payment.amount
    ) THEN
        RAISE EXCEPTION 'Order, order detail and payment amounts are inconsistent.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM seed_purchase_plan plan
        JOIN order_details detail ON detail.id = plan.order_detail_id
        JOIN payments payment ON payment.id = plan.payment_id
        WHERE (plan.order_status = 1 AND (payment.status <> 2 OR detail.status <> 1))
           OR (plan.order_status = 0 AND (payment.status <> 1 OR detail.status <> 1))
           OR (plan.order_status = -1 AND (payment.status <> 3 OR detail.status <> 1))
           OR (plan.order_status = 2 AND (payment.status <> 4 OR detail.status <> 0))
    ) THEN
        RAISE EXCEPTION 'Order, payment and order-detail statuses are inconsistent.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM enrollments enrollment
        JOIN order_details detail ON detail.id = enrollment.order_detail_id
        JOIN orders ord ON ord.id = detail.order_id
        JOIN seed_context context ON true
        JOIN seed_run_items item ON item.run_id = context.run_id AND item.table_name = 'enrollments' AND item.record_id = enrollment.id::TEXT
        WHERE ord.status NOT IN (1, 2) OR enrollment.created_at < ord.created_at
    ) THEN
        RAISE EXCEPTION 'Enrollment precedes a successful historical payment.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM seed_payout_plan payout
        JOIN (
            SELECT account_id, sum(instructor_amount) AS earned
            FROM seed_wallet_plan WHERE wallet_status = 1 GROUP BY account_id
        ) revenue ON revenue.account_id = payout.account_id
        GROUP BY payout.account_id, revenue.earned
        HAVING sum(CASE WHEN payout.status IN (1, 2, 3) THEN payout.amount ELSE 0 END) > revenue.earned
    ) THEN
        RAISE EXCEPTION 'A payout exceeds the instructor revenue available to seed.';
    END IF;
END $$;

UPDATE seed_runs
SET status = 'COMPLETED', completed_at = NOW()
WHERE id = (SELECT run_id FROM seed_context);

SELECT item.table_name, count(*) AS records_created
FROM seed_run_items item
JOIN seed_context context ON context.run_id = item.run_id
GROUP BY item.table_name
ORDER BY item.table_name;

COMMIT;

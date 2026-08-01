-- Undo the most recently completed reversible seed run.
--
-- This deletes only IDs recorded in seed_run_items. It never restores data
-- changed by a seed; reversible seeds must therefore insert new records only.

BEGIN;

DO $$
DECLARE
    v_run_id UUID;
    v_table_name TEXT;
    v_delete_order TEXT[] := ARRAY[
        'quiz_results', 'quiz_questions', 'lesson_progress', 'enrollments',
        'refunds', 'payments', 'gifts', 'payouts', 'order_details',
        'attachments', 'lessons', 'quizzes', 'questions', 'reviews',
        'comments', 'thread_hashtags', 'members', 'votes', 'reports',
        'threads', 'favorites', 'modules', 'orders', 'account_banks',
        'wallets', 'follows', 'notifications', 'logs', 'supports', 'devices',
        'coupons', 'commissions', 'courses', 'topics', 'categories',
        'hashtags', 'terms', 'term_modules', 'pages', 'banners', 'banks',
        'system_configs', 'accounts', 'roles'
    ];
BEGIN
    SELECT id INTO v_run_id
    FROM seed_runs
    WHERE status = 'COMPLETED'
    ORDER BY completed_at DESC, created_at DESC, id DESC
    LIMIT 1
    FOR UPDATE;

    IF v_run_id IS NULL THEN
        RAISE NOTICE 'No completed seed run remains to undo.';
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM seed_run_items
        WHERE run_id = v_run_id
          AND NOT (table_name = ANY (v_delete_order))
    ) THEN
        RAISE EXCEPTION 'Seed run % contains an unsupported table. Update undo_last_seed.sql before undoing it.', v_run_id;
    END IF;

    FOREACH v_table_name IN ARRAY v_delete_order LOOP
        EXECUTE format(
            'DELETE FROM %I WHERE id::TEXT IN (
                SELECT record_id FROM seed_run_items WHERE run_id = $1 AND table_name = $2
            )',
            v_table_name
        ) USING v_run_id, v_table_name;
    END LOOP;

    UPDATE seed_runs
    SET status = 'UNDONE', undone_at = NOW()
    WHERE id = v_run_id;

    RAISE NOTICE 'Undid seed run %.', v_run_id;
END $$;

SELECT id, seed_name, status, created_at, completed_at, undone_at
FROM seed_runs
ORDER BY created_at DESC
LIMIT 10;

COMMIT;

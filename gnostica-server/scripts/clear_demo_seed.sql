-- Removes only the demo records created by seed_demo_data.sql.
-- It does not touch manually created instructor accounts or the migration-created admin.

BEGIN;

DELETE FROM lessons l
USING modules m, courses c
WHERE l.module_id = m.id
  AND m.course_id = c.id
  AND c.metadata ->> 'seed_batch' = 'gnostica-demo-v1';

DELETE FROM modules m
USING courses c
WHERE m.course_id = c.id
  AND c.metadata ->> 'seed_batch' = 'gnostica-demo-v1';

DELETE FROM courses
WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1';

DELETE FROM categories
WHERE slug LIKE 'seed-%'
  AND parent_id IS NOT NULL;

DELETE FROM categories
WHERE slug LIKE 'seed-%';

DELETE FROM accounts
WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1';

COMMIT;

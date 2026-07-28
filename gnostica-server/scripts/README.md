# Demo database seed

`seed_demo_data.sql` is a manual seed script for a newly created Gnostica database.
It is deliberately not a Flyway migration: every developer has different instructor
account UUIDs.

## Before running

1. Create the real instructor accounts through the app.
2. Change those accounts to the `INSTRUCTOR` role.
3. Copy their account UUIDs.
4. Replace `ARRAY[]::UUID[]` at the top of `seed_demo_data.sql` with the UUIDs.

For example:

```sql
FROM unnest(ARRAY[
  '11111111-1111-1111-1111-111111111111'::UUID,
  '22222222-2222-2222-2222-222222222222'::UUID
]::UUID[]) AS supplied_id;
```

The script validates every supplied UUID before creating anything. Courses are assigned
round-robin across those instructors, so 150 courses are divided as evenly as possible.

## Running from `.env`

After filling in the UUID array, an agent can run the script through the server's
database settings with:

```powershell
./scripts/run_demo_seed.ps1
```

The PowerShell helper reads only `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` from
`gnostica-server/.env`, passes them to `psql` without printing them, and stops at the
first SQL error. If PostgreSQL command-line tools are unavailable, run the SQL file in
DBeaver instead, or use the included JDBC fallback:

```powershell
java --class-path postgresql.jar scripts/SeedDemoRunner.java
```

To verify the created totals and course allocation without changing data:

```powershell
java --class-path postgresql.jar scripts/SeedDemoRunner.java --verify
```

## Data created

- 999 fictional learner accounts (together with the migration-created admin: 1,000 accounts)
- 36 categories: 6 parent categories and 30 child categories
- 150 published courses, created directly under the supplied instructor UUIDs
- 1,500 modules and 15,000 lessons

All generated records are marked with `metadata.seed_batch = "gnostica-demo-v1"`.
The script refuses to run if the batch already exists. It uses the agreed Cloudinary
image URL and Bunny video UUID. It does not create payments, orders, banks, or use any
personal email address.

`clear_demo_seed.sql` removes exactly this labeled batch in dependency-safe order. It
preserves the migration-created admin and manually created instructor accounts.

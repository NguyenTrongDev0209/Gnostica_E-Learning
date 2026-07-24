ALTER TABLE commissions
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN commissions.metadata IS
    'Flexible JSON metadata for commission audit notes, source context, or future extension fields.';

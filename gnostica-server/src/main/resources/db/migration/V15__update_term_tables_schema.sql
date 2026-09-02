-- Align term_modules table with TermModule entity
ALTER TABLE term_modules ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE term_modules ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE term_modules ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Populate new columns if old columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'term_modules' AND column_name = 'name') THEN
        UPDATE term_modules SET title = name WHERE title IS NULL;
        ALTER TABLE term_modules ALTER COLUMN name DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'term_modules' AND column_name = 'slug') THEN
        ALTER TABLE term_modules ALTER COLUMN slug DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'term_modules' AND column_name = 'order_index') THEN
        UPDATE term_modules SET sort_order = order_index WHERE sort_order IS NULL OR sort_order = 0;
    END IF;
END $$;

UPDATE term_modules SET title = '' WHERE title IS NULL;
UPDATE term_modules SET metadata = '{}'::jsonb WHERE metadata IS NULL;
UPDATE term_modules SET sort_order = 0 WHERE sort_order IS NULL;

ALTER TABLE term_modules ALTER COLUMN title SET NOT NULL;
ALTER TABLE term_modules ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE term_modules ALTER COLUMN metadata SET NOT NULL;

-- Align terms table with Term entity
ALTER TABLE terms ADD COLUMN IF NOT EXISTS term_module_id INTEGER;
ALTER TABLE terms ADD COLUMN IF NOT EXISTS url_path VARCHAR(255);
ALTER TABLE terms ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE terms ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Populate new columns if old columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'terms' AND column_name = 'module_id') THEN
        UPDATE terms SET term_module_id = module_id WHERE term_module_id IS NULL;
        ALTER TABLE terms ALTER COLUMN module_id DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'terms' AND column_name = 'order_index') THEN
        UPDATE terms SET sort_order = order_index WHERE sort_order IS NULL OR sort_order = 0;
    END IF;
END $$;

-- Add foreign key constraint for term_module_id if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'terms' AND constraint_name = 'fk_terms_term_module'
    ) THEN
        ALTER TABLE terms ADD CONSTRAINT fk_terms_term_module 
            FOREIGN KEY (term_module_id) REFERENCES term_modules(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'terms' AND constraint_name = 'uq_terms_url_path'
    ) THEN
        ALTER TABLE terms ADD CONSTRAINT uq_terms_url_path UNIQUE (url_path);
    END IF;
END $$;

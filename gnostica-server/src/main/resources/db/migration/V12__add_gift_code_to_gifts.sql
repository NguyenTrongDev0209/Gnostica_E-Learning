ALTER TABLE gifts ADD COLUMN gift_code VARCHAR(12);

UPDATE gifts 
SET gift_code = (100000000000 + floor(random() * 900000000000))::bigint::text 
WHERE gift_code IS NULL;

CREATE UNIQUE INDEX uq_gifts_gift_code ON gifts(gift_code);

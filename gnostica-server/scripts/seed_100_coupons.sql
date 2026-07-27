-- Seed 100 coupons for manual testing. Run manually against PostgreSQL.
-- The script is idempotent: rerunning it updates coupons with codes SEED-CPN-001..100.

DO $$
DECLARE
    admin_id CONSTANT UUID := '00000000-0000-0000-0000-000000000001';
    instructor_ids CONSTANT UUID[] := ARRAY[
        '6419a9db-f323-421a-b952-9c7903013ea9'::UUID,
        '03e75e18-5cda-4090-8818-88e247a006a7'::UUID,
        '74b00646-224c-490f-be44-de254d35fc7e'::UUID
    ];
    owner_ids UUID[];
    owner_id UUID;
    scope_course_id UUID;
    scope_category_id INT;
    coupon_metadata JSONB;
    coupon_status INT;
    coupon_discount_type INT;
    coupon_discount_value DECIMAL(18, 6);
    coupon_quantity INT;
    coupon_valid_from TIMESTAMP;
    coupon_valid_until TIMESTAMP;
    coupon_id UUID;
    i INT;
BEGIN
    owner_ids := ARRAY[admin_id, instructor_ids[1], instructor_ids[2], instructor_ids[3]];

    IF (SELECT COUNT(*) FROM accounts WHERE id = ANY(owner_ids) AND deleted_at IS NULL) <> 4 THEN
        RAISE EXCEPTION 'Missing one or more seed coupon owners. Check the supplied Admin and Instructor IDs.';
    END IF;

    FOR i IN 1..100 LOOP
        owner_id := owner_ids[((i - 1) % ARRAY_LENGTH(owner_ids, 1)) + 1];
        coupon_discount_type := CASE WHEN i % 2 = 0 THEN 1 ELSE 2 END;

        IF coupon_discount_type = 1 THEN
            coupon_discount_value := CASE
                WHEN i % 20 = 0 THEN 100
                WHEN i % 10 = 0 THEN 95
                ELSE 5 + ((i % 8) * 5)
            END;
        ELSE
            coupon_discount_value := CASE
                WHEN i % 10 = 1 THEN 500000
                WHEN i % 10 IN (3, 5) THEN 200000
                WHEN i % 10 IN (7, 9) THEN 100000
                ELSE 50000
            END;
        END IF;

        -- The instructor quantity rules are respected by seeded data. Admin remains unrestricted.
        coupon_quantity := CASE
            WHEN owner_id <> admin_id AND coupon_discount_type = 1 AND coupon_discount_value >= 90 THEN 1
            WHEN owner_id <> admin_id AND coupon_discount_type = 2 AND coupon_discount_value >= 500000 THEN 1
            WHEN owner_id <> admin_id AND coupon_discount_type = 2 AND coupon_discount_value >= 200000 THEN 2
            WHEN owner_id <> admin_id AND coupon_discount_type = 2 AND coupon_discount_value >= 100000 THEN 5
            ELSE 10 + (i % 91)
        END;

        coupon_status := CASE
            WHEN i % 5 = 0 THEN 2 -- Expired
            WHEN i % 5 = 1 THEN 0 -- Inactive
            ELSE 1                -- Active
        END;
        coupon_valid_from := CASE WHEN coupon_status = 0 THEN CURRENT_TIMESTAMP + INTERVAL '7 days' ELSE CURRENT_TIMESTAMP - INTERVAL '14 days' END;
        coupon_valid_until := CASE WHEN coupon_status = 2 THEN CURRENT_TIMESTAMP - INTERVAL '1 day' ELSE CURRENT_TIMESTAMP + ((30 + (i % 90)) || ' days')::INTERVAL END;

        scope_course_id := NULL;
        scope_category_id := NULL;
        IF owner_id = admin_id THEN
            IF i % 12 = 0 THEN
                SELECT id INTO scope_course_id FROM courses WHERE deleted_at IS NULL ORDER BY created_at NULLS LAST, id LIMIT 1;
            ELSIF i % 8 = 0 THEN
                SELECT id INTO scope_category_id FROM categories WHERE deleted_at IS NULL ORDER BY sort_order NULLS LAST, id LIMIT 1;
            END IF;

            coupon_metadata := CASE
                WHEN scope_course_id IS NOT NULL THEN jsonb_build_object('scope', 'COURSES', 'courseIds', jsonb_build_array(scope_course_id), 'categoryIds', jsonb_build_array())
                WHEN scope_category_id IS NOT NULL THEN jsonb_build_object('scope', 'CATEGORIES', 'courseIds', jsonb_build_array(), 'categoryIds', jsonb_build_array(scope_category_id))
                ELSE jsonb_build_object('scope', 'ALL_PLATFORM', 'courseIds', jsonb_build_array(), 'categoryIds', jsonb_build_array())
            END;
        ELSE
            IF i % 4 = 0 THEN
                SELECT id INTO scope_course_id FROM courses WHERE account_id = owner_id AND deleted_at IS NULL ORDER BY created_at NULLS LAST, id LIMIT 1;
            END IF;
            coupon_metadata := CASE
                WHEN scope_course_id IS NOT NULL THEN jsonb_build_object('scope', 'COURSES', 'courseIds', jsonb_build_array(scope_course_id), 'categoryIds', jsonb_build_array())
                ELSE jsonb_build_object('scope', 'ALL_OWNER_COURSES', 'courseIds', jsonb_build_array(), 'categoryIds', jsonb_build_array())
            END;
        END IF;

        coupon_id := (
            SUBSTRING(md5('gnostica-seed-coupon-' || i) FROM 1 FOR 8) || '-' ||
            SUBSTRING(md5('gnostica-seed-coupon-' || i) FROM 9 FOR 4) || '-' ||
            SUBSTRING(md5('gnostica-seed-coupon-' || i) FROM 13 FOR 4) || '-' ||
            SUBSTRING(md5('gnostica-seed-coupon-' || i) FROM 17 FOR 4) || '-' ||
            SUBSTRING(md5('gnostica-seed-coupon-' || i) FROM 21 FOR 12)
        )::UUID;

        INSERT INTO coupons (
            id, account_id, code, name, discount_type, discount_value,
            min_discount, max_discount, quantity, valid_from, valid_until,
            status, metadata, created_at, updated_at, deleted_at
        ) VALUES (
            coupon_id,
            owner_id,
            'SEED-CPN-' || LPAD(i::TEXT, 3, '0'),
            CASE
                WHEN i % 6 = 0 THEN 'Ưu đãi khai giảng ' || i
                WHEN i % 6 = 1 THEN 'Khuyến mãi học viên mới ' || i
                WHEN i % 6 = 2 THEN 'Mã giảm giá cuối tuần ' || i
                WHEN i % 6 = 3 THEN 'Ưu đãi nâng cao kỹ năng ' || i
                WHEN i % 6 = 4 THEN 'Khuyến mãi chuyên đề ' || i
                ELSE 'Voucher học tập ' || i
            END,
            coupon_discount_type,
            coupon_discount_value,
            CASE WHEN i % 3 = 0 THEN 500000 ELSE 0 END,
            CASE WHEN coupon_discount_type = 1 THEN CASE WHEN i % 4 = 0 THEN 300000 ELSE 1000000 END ELSE NULL END,
            coupon_quantity,
            coupon_valid_from,
            coupon_valid_until,
            coupon_status,
            coupon_metadata,
            CURRENT_TIMESTAMP - ((i % 60) || ' days')::INTERVAL,
            CURRENT_TIMESTAMP,
            NULL
        )
        ON CONFLICT (code) DO UPDATE SET
            account_id = EXCLUDED.account_id,
            name = EXCLUDED.name,
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            min_discount = EXCLUDED.min_discount,
            max_discount = EXCLUDED.max_discount,
            quantity = EXCLUDED.quantity,
            valid_from = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = CURRENT_TIMESTAMP,
            deleted_at = NULL;
    END LOOP;
END $$;

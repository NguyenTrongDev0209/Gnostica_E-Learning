\pset pager off
SELECT 'tong_doanh_thu_payment_t8' AS metric,
  COALESCE(SUM(p.amount),0) AS value
FROM payments p JOIN orders o ON p.order_id=o.id
WHERE p.status=2 AND o.status<>2 AND p.created_at>='2026-08-01' AND p.created_at<'2026-09-01';

SELECT 'tong_payment_theo_ngay_tao_don_t8' AS metric,
  COALESCE(SUM(p.amount),0) AS value
FROM payments p JOIN orders o ON p.order_id=o.id
WHERE p.status=2 AND o.status<>2 AND o.created_at>='2026-08-01' AND o.created_at<'2026-09-01';

SELECT 'doanh_thu_gv_t8' AS metric,
  COALESCE(SUM(((od.price*(100-COALESCE(od.discount,0))/100.0)-COALESCE(o.coupon_price,0))*COALESCE(c.instructor_ratio,90)/100.0),0) AS value
FROM order_details od JOIN orders o ON od.order_id=o.id
LEFT JOIN commissions c ON od.commission_id=c.id
WHERE od.status=1 AND o.status=1 AND o.created_at>='2026-08-01' AND o.created_at<'2026-09-01';

-- Chi tiết từng payment tháng 8 (để đối chiếu)
SELECT o.order_code, o.status AS order_status, p.gateway, p.status AS pay_status,
       p.amount, p.created_at AS pay_created, o.created_at AS order_created,
       o.payment_method, o.total_price, o.coupon_price
FROM payments p JOIN orders o ON p.order_id=o.id
WHERE p.status=2 AND p.created_at>='2026-08-01' AND p.created_at<'2026-09-01'
ORDER BY p.created_at;

-- Chi tiết order_detail tháng 8 (đơn tạo trong T8)
SELECT o.order_code, o.status AS order_status, o.total_price, o.coupon_price,
       od.price AS od_price, od.discount, c.instructor_ratio, c.platform_ratio,
       od.created_at AS od_created
FROM order_details od JOIN orders o ON od.order_id=o.id
LEFT JOIN commissions c ON od.commission_id=c.id
WHERE o.created_at>='2026-08-01' AND o.created_at<'2026-09-01' AND od.status=1
ORDER BY o.created_at;

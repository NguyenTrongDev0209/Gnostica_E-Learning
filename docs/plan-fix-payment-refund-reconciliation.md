# Plan: Sửa toàn bộ lỗi đối soát thanh toán / hoàn tiền

TL;DR: Sửa 5 lỗi đã phát hiện trong flow thanh toán/tặng quà/coupon/hoàn tiền: (1) double-refund khi hoàn đơn WALLET, (2) đơn FREE/COUPON không có Payment record, (3) coupon không được khôi phục khi hoàn, (4) hoàn quà tặng không cập nhật Payment REFUNDED, (5) ERD lệch schema thực tế.

Quyết định đã xác nhận (2026-08-11):
- C.1: Phương án A — giữ Payment WALLET ở SUCCESS (debit ví còn tính), chỉ mark PAYOS/VNPAY REFUNDED. Hoàn tiền ghi dòng wallet type=6 rõ ràng.
- C.3: Khôi phục coupon (quantity +1) cho CẢ hoàn thường (RefundService.applyRefundInternal) VÀ hoàn quà (GiftService.refundGift).
- C.2: Đơn FREE (0đ) phải có Payment record như bình thường.

## Phase 1 — Refund side-effects (C.1 + C.3 + C.4)

1. `PaymentService.java`: thêm helper `@Transactional markNonWalletPaymentsRefunded(Order order)` — lặp `paymentRepository.findByOrder(order)`, mark `SUCCESS → REFUNDED` chỉ khi `!"WALLET".equalsIgnoreCase(p.getGateway())`. (PaymentService đã có paymentRepository.)
2. `CouponService.java`: thêm `@Transactional restoreCouponUse(Order order)` — nếu order/coupon null hoặc `quantity == null` thì no-op; ngược lại `couponRepository.findByIdForUpdate(order.getCoupon().getId())` rồi `quantity += 1` + save.
3. `RefundService.java`:
   - Inject thêm `PaymentService` và `CouponService` (không tạo vòng phụ thuộc).
   - Trong `applyRefundInternal`: thay vòng lặp mark payment bằng `paymentService.markNonWalletPaymentsRefunded(order)`; thêm `couponService.restoreCouponUse(order)` sau khi order set REFUNDED.
   - (Tùy chọn) dọn tham số `payments` không còn dùng.
4. `GiftService.java`:
   - Inject thêm `CouponService` (đã có PaymentService).
   - Trong `refundGift`: sau khi set order REFUNDED, thêm `paymentService.markNonWalletPaymentsRefunded(order)` + `couponService.restoreCouponUse(order)`.

## Phase 2 — Ghi nhận Payment cho đơn FREE/COUPON (C.2)

5. Migration mới `V7__allow_zero_amount_payments.sql`:
   - `ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_amount_check;`
   - `ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount >= 0);`
   - Lưu ý: xác minh tên constraint thực tế (PostgreSQL đặt mặc định `payments_amount_check`).
6. `OrderService.java` nhánh `actualPrice == 0` (FREE/COUPON): trước `if (!deferImmediateSuccess) processSuccessfulOrder(order)`, gọi `paymentService.saveTransaction(...)` với gateway="FREE", transactionCode="FREE-"+orderCode, amount=0L, status="PAID", paidAt=now, payload rỗng. (Gọi bất kể defer — giống nhánh WALLET; gift FREE cũng có payment.)

## Phase 3 — Cập nhật tài liệu ERD (C.5)

7. `erd_tables.md`:
   - Mục `## 25. Payments`: bỏ các cột ảo không tồn tại (account_number, sender_bank_bin, sender_account_number, bank_code, card_type, gateway_response_code, gateway_transaction_status, raw_callback); ghi chú dữ liệu ngân hàng/gateway nằm trong `payload` JSONB; đổi amount CHECK thành `>= 0`.
   - Thêm mục bảng `Gifts` (V1: id, sender_id, receiver_id, course_id, order_id, token UQ, message, status, created_at, updated_at, expired_at; status 0 PENDING, 1 ACCEPTED, 2 REJECTED, 3 EXPIRED).
   - Cập nhật ghi chú phiên bản (bản 7): đơn FREE có Payment record.

## Phase 4 — Test + xác minh

8. `RefundServiceTest.java` (thêm):
   - `refundWalletPayment_keepsPaymentSuccess` — payment gateway=WALLET SUCCESS; sau approve/auto-approve → payment vẫn SUCCESS (không REFUNDED); `walletService.addRefund` gọi đúng 1 lần.
   - `refundGatewayPayment_marksRefunded` — payment gateway=PAYOS → sau refund → REFUNDED.
   - `refund_restoresCoupon` — verify `couponService.restoreCouponUse(order)` được gọi.
9. `CouponServiceTest.java` (thêm): `restoreCouponUse_incrementsQuantity` (5→6); `restoreCouponUse_noop_whenNoCouponOrUnlimited`.
10. (Trung bình, tùy chọn) Test cho nhánh FREE trong OrderService — verify tạo Payment gateway=FREE amount=0.
11. Chạy `mvnw.cmd test` toàn bộ → BUILD SUCCESS.

## Relevant files
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/PaymentService.java` — thêm `markNonWalletPaymentsRefunded`.
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/CouponService.java` — thêm `restoreCouponUse`.
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/RefundService.java` — `applyRefundInternal`: payment marking + coupon restore.
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/GiftService.java` — `refundGift`: payment marking + coupon restore.
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/OrderService.java` — nhánh FREE/COUPON: saveTransaction.
- `gnostica-server/src/main/resources/db/migration/V7__allow_zero_amount_payments.sql` — nới CHECK.
- `gnostica-server/erd_tables.md` — Payments (bỏ cột ảo, CHECK >= 0), thêm Gifts.
- Tests: `RefundServiceTest.java`, `CouponServiceTest.java`, (tùy chọn) `OrderServiceTest`.

## Verification
1. `mvnw.cmd test -Dtest=RefundServiceTest,CouponServiceTest` → pass.
2. `mvnw.cmd test` → BUILD SUCCESS toàn bộ.
3. Kiểm tra DB: `\d payments` → `amount ... CHECK (amount >= 0)`.
4. Kiểm chứng logic: hoàn đơn WALLET → ví chỉ +1 lần; coupon quantity +1; hoàn quà → payment PAYOS/VNPAY REFUNDED.

## Scope
- Chỉ backend + migration + tài liệu ERD. Không đổi frontend/web/mobile.
- Đơn FREE vẫn không hoàn tiền được (amountPaidForDetail=0, RefundService chặn) — giữ nguyên, hợp lý.

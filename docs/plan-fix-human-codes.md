# Plan: Chuẩn hóa mã hiển thị thân thiện (12 chữ số) cho các bảng tài chính

TL;DR: Tất cả trường mã hiển thị (order_code, payout_code, refund_code, payment_code, gift_code) **lưu đúng 12 chữ số (số) trong DB**, KHÔNG lưu prefix. Khi hiển thị, **FE tự thêm prefix** (`RT`/`HT`/`TG`...). Một **utility chung** sinh 12 chữ số với retry 5 + check tồn tại + DB unique là lưới an toàn. **UUID vẫn là PK logic** — mã hiển thị không tham gia logic hệ thống. `order_code` giữ nguyên (12 số, BIGINT, gửi thẳng PayOS/VNPay). `payments.payment_code = order_code` (phương án A). `gift_code` mới. `wallet_code` ĐỂ SAU.

Quyết định đã xác nhận (2026-08-12):
- C.1: UUID là PK + tham chiếu logic; mã hiển thị chỉ để đọc/tra cứu, KHÔNG ảnh hưởng logic.
- C.2: **Mọi mã lưu đúng 12 chữ số (số)**, không lưu prefix; FE thêm prefix khi hiển thị.
- C.3: Một utility chung: sinh `100_000_000_000 + random(900_000_000_000)`, retry 5, check tồn tại, throw sau 5 lần.
- C.4: `order_code` **giữ nguyên** (12 số, BIGINT) — là hợp đồng với PayOS (orderCode) / VNPay (vnp_TxnRef); không thêm prefix, không đổi kiểu.
- C.5: `payments.transaction_code → payment_code`, **giá trị = order_code** (phương án A) — không sinh mới, đồng nhất format, bỏ nhầm lẫn cột trùng `gateway_transaction_no`.
- C.6: `payout_code`/`refund_code` **bỏ prefix `RT`/`HT`** trong DB (chỉ còn 12 số).
- C.7: Thêm `gifts.gift_code` (12 số), nullable + unique; backfill dữ liệu cũ.
- C.8: `wallets.wallet_code` **KHÔNG làm đợt này** (đụng 4 write path + seed + backfill) — tách plan riêng.
- C.9: FE thêm prefix khi hiển thị (không để backend trả sẵn prefix).

## Nền tảng đối soát (đã xác minh — RÀNG BUỘC)
- `order_code` GỬI RA NGOÀI: PayOS (`.orderCode`, cancel, get) + VNPay (`vnp_TxnRef`, QueryDR) + webhook match (`findByOrderCodeForUpdate`) + return URL + `PUT /orders/{orderCode}/cancel`. → KHÔNG đổi format/kiểu.
- `payout_code` (12 số sau khi bỏ `RT`) GỬI RA NGOÀI: PayOS `referenceId` (create + `findByReference` idempotency) + `PayoutReconciliationScheduler.reconcile` so sánh reference. → sau khi bỏ `RT`, DB và PayOS đều dùng 12 số → nhất quán.
- `refund_code`, `payment_code`, `gift_code`: KHÔNG gửi ra ngoài → thoải mái đổi/thêm.

## Phase 0 — Utility chung

1. TẠO `core/util/HumanCodeGenerator.java`:
   - `String next(java.util.function.Predicate<String> exists)` → 12 chữ số (dạng `String.valueOf(100_000_000_000L + ThreadLocalRandom.current().nextLong(900_000_000_000L))`), 5 retry, check `exists`, throw `IllegalStateException` sau 5 lần.
   - Không có prefix ở tầng utility.
2. `OrderService.generateUniqueOrderCode()` → gọi utility (hoặc giữ nguyên vì đã tương đương) — **giữ output 12 số như cũ**.

## Phase 1 — payout_code: bỏ prefix RT

3. Migration (V11 hoặc gộp): `UPDATE payouts SET payout_code = substring(payout_code, 3) WHERE payout_code LIKE 'RT%';` — phần 12 số vốn unique nên không lo trùng.
4. `WalletService.generateUniquePayoutCode()`: bỏ `"RT" + ` → trả 12 số.
5. `PayoutSubmissionService`/`PayoutReconciliationScheduler`: **không đổi logic** (gửi/so sánh `payoutCode` = 12 số).
6. `AdminTransactionService.toWithdrawalResponse` `firstNonBlank(payoutCode, gatewayPayoutId, id)`: giữ nguyên (FE tự thêm `RT`).

## Phase 2 — refund_code: bỏ prefix HT + thêm retry + hiển thị

7. Migration (gộp V11): `UPDATE refunds SET refund_code = substring(refund_code, 3) WHERE refund_code LIKE 'HT%';`
8. `Refund.prePersist`: bỏ sinh prefix (chỉ chừa fallback null-safe, không sinh ký tự).
9. `RefundRepository`: thêm `boolean existsByRefundCode(String refundCode)`.
10. Sinh 12 số qua utility ở **2 nơi tạo Refund**: `RefundService.requestRefund`, `GiftService.refundGift` (inject RefundRepository).
11. Frontend hiển thị `refund_code` (+ prefix `HT`): `RefundsPage` (useRefunds), `RefundModerationList`.

## Phase 3 — payments: rename transaction_code → payment_code (= order_code)

12. Migration `V11__rename_payments_transaction_code_to_payment_code.sql`:
    - `ALTER TABLE payments RENAME COLUMN transaction_code TO payment_code;`
    - `ALTER INDEX idx_payments_transaction_code RENAME TO idx_payments_payment_code;`
    - Backfill: `UPDATE payments SET payment_code = o.order_code::text FROM orders o WHERE o.id = payments.order_id AND payments.payment_code IS DISTINCT FROM o.order_code::text;`
13. `Payment.java`: field `transactionCode` → `paymentCode` (`@Column`, cột `payment_code`).
14. `PaymentRepository`: xóa `existsByTransactionCode` (dead code — không caller).
15. `PaymentService.saveTransaction` + `saveTransactionFromPolling`: `setPaymentCode(String.valueOf(order.getOrderCode()))` (lấy từ order — KHÔNG dùng `data.getTransactionCode()` nữa cho cột này).
16. Sửa **seed_05**: cột `transaction_code` → `payment_code` trong `INSERT INTO payments`.
17. ERD ## 25: đổi tên cột + sửa ghi chú (cột KHÔNG unique — chỉ index; ERD đang ghi UQ sai).

## Phase 4 — gifts: thêm gift_code (12 số)

18. Migration `V12__add_gift_code_to_gifts.sql`:
    - `ALTER TABLE gifts ADD COLUMN gift_code VARCHAR(13);`
    - `CREATE UNIQUE INDEX uq_gifts_gift_code ON gifts(gift_code);`
    - Backfill gift cũ (script 1 lần hoặc ApplicationRunner, tránh trùng).
19. `Gift.java`: thêm `@Column(name="gift_code", unique=true, length=13) private String giftCode;` (nullable).
20. `GiftRepository`: `boolean existsByGiftCode(String giftCode)`.
21. `GiftService.createGift`: `gift.setGiftCode(HumanCodeGenerator.next(giftRepository::existsByGiftCode))`.
22. `GiftService.refundGift`: reason `"REFUND_GIFT_" + gift.getGiftCode() + " - " + reason` (thay token).
23. `GiftDetailResponse`: thêm `giftCode`; frontend GiftResponse (web/mobile) hiển thị + prefix `TG`.
24. ERD ## 43: thêm `gift_code` (UQ).

## Phase 5 — FE hiển thị prefix (thay vì UUID / thêm prefix)

25. Web:
    - `InstructorRevenue`: hiển thị mã rút tiền = `RT` + `payout_code` (thay `TRX-<uuid>`; cần thêm `payoutCode` vào `PayoutResponse`).
    - `AdminUsers` PAYOUT: hiển thị `RT` + `payout_code` (thay `c.id` uuid).
    - `RefundsPage` / `RefundModerationList`: `HT` + `refund_code` (thay `orderCode`).
    - `AdminTransactions` payments: giữ `TT`+orderCode (đã đọc được).
    - `GiftResponsePage`: `TG` + `gift_code`.
26. Mobile: `RefundScreen`, `GiftResponseScreen` hiển thị mã (thêm prefix).

## Phase 6 (tùy chọn — từ rà soát flow thanh toán/tặng quà, KHÔNG liên quan mã)

27. `GiftService.acceptGift`: thêm guard `gift.getOrder() == null || gift.getOrder().getStatus() != OrderStatus.PAID → từ chối "Đơn chưa thanh toán"` (tránh accept gift chưa trả tiền).
28. `GiftService.searchReceiver`: `hasValidPending` tính cả gift có order PENDING (chưa trả) để chặn tạo gift trùng.
29. `GiftService.refundGift`: cho đơn 0đ (coupon 100%) vẫn `restoreCouponUse` + void earning (không addRefund vì amount=0).

## Phase 7 — Xác minh

30. `mvnw.cmd test`: OrderServiceTest, WalletServiceTest, RefundServiceTest, PaymentServiceTest, PayoutAdminServiceTest xanh (không đổi output order_code/payout_code 12 số).
31. Boot server: Flyway áp dụng V11 (strip prefix + rename payments) + V12 (gift_code) → `\d payouts` payout_code 12 số; `\d payments` payment_code; `\d gifts` gift_code.
32. Seed chạy lại OK (sửa cột payments).
33. Web build + vitest; mobile build; manual: RefundsPage `HT`+code, GiftResponse `TG`+code, InstructorRevenue/AdminUsers không còn UUID.
34. Kiểm tra đối soát: tạo payout mới → PayOS nhận 12 số referenceId; retry tìm lại được; tạo gift → gift_code unique; hoàn gift → reason dùng gift_code.

## Relevant files
- `gnostica-server/.../core/util/HumanCodeGenerator.java` — TẠO MỚI.
- `gnostica-server/.../wallet/service/WalletService.java` — bỏ `RT` trong `generateUniquePayoutCode`.
- `gnostica-server/.../core/model/Refund.java` + `RefundRepository` + `RefundService` + `GiftService` — refund_code 12 số + retry.
- `gnostica-server/.../core/model/Payment.java` + `PaymentRepository` + `PaymentService` — payment_code = order_code.
- `gnostica-server/.../core/model/Gift.java` + `GiftRepository` + `GiftService` — gift_code.
- `gnostica-server/src/main/resources/db/migration/V11__*.sql` + `V12__add_gift_code_to_gifts.sql` — TẠO MỚI.
- `gnostica-server/scripts/seed_05_commerce_ownership_data.sql` — cột payments.
- `gnostica-server/erd_tables.md` — ## 25 (payment_code + sửa UQ), ## 43 (gift_code).
- `gnostica-web`: `InstructorRevenue.jsx`, `AdminUsers.jsx`, `RefundsPage.jsx`, `RefundModerationList.jsx`, `GiftResponsePage.jsx` — hiển thị prefix.
- `gnostica-mobile`: `RefundScreen.jsx`, `GiftResponseScreen.jsx` — hiển thị prefix.

## BÁO ẢNH HƯỞNG (rủi ro nếu không cẩn thận)
1. **payout_code bỏ `RT`**: DB + PayOS referenceId đều chuyển sang 12 số. **Payout CŨ đã tạo bên PayOS với reference `RT`+12 sẽ không được `findByReference(12 số)` tìm thấy** nếu DB mất `gatewayPayoutId` (crash giữa create/save) rồi retry → nguy cơ tạo trùng payout. Nếu chưa production: bỏ qua; nếu có dữ liệu thật: cân nhắc.
2. **payments rename**: bắt buộc sửa `seed_05`; `payment_code = order_code` → nhiều payment cho 1 order sẽ trùng mã hiển thị (chấp nhận, dedup vẫn dùng `gateway_transaction_no`).
3. **refund_code**: seed để NULL (nullable+unique OK); nếu bỏ `@PrePersist` mà quên set ở 1 trong 2 nơi tạo Refund → NULL (không crash, hiển thị N/A).
4. **gift_code**: cột mới nullable; gift cũ chưa có mã → backfill tránh trùng; nếu không backfill thì hiển thị trống (không crash).
5. **order_code**: KHÔNG đổi gì (giữ 12 số) — tránh tuyệt đối đụng type/format (hợp đồng cổng).

## Scope
- Làm: utility chung + strip prefix payout/refund + rename payment_code(=order_code) + thêm gift_code + FE hiển thị prefix + (Phase 6) sửa 3 lỗi gift.
- KHÔNG làm: wallet_code (Phase riêng), đổi order_code type.
- KHÔNG đổi: UUID/PK, `gateway_transaction_no` (dedup webhook), DTO gateway (PaymentWebhookData/PaymentDetails), API contract thanh toán, logic hoàn tiền/rút tiền.
- Plan thanh toán bằng ví đã có riêng: `docs/plan-fix-wallet-payment.md` (đã implement + đã sửa 2 lỗi đọc số dư; unit test tạm hoãn theo yêu cầu).

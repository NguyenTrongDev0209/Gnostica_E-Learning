# Plan: Sửa các lỗi tài chính phát hiện 2026-08-12

TL;DR: Sửa 7 hạng mục từ đợt rà soát tài chính: S1 (auth BankController), S2 (role CouponController), L1 (mua trùng khóa → cộng tiền vào ví), L2 (payout mồ côi → save-trước-submit-sau), L3 (lịch sử giao dịch ví gộp — qua endpoint mới), L4 (xóa dead code addBalance), L5 (log hygiene). Kèm test.

Quyết định đã xác nhận (2026-08-12):
- L1: Cộng vào ví (`addDeposit`), giữ payment SUCCESS — giống luồng late-payment.
- Phạm vi: toàn bộ S1–L5.
- L3: làm luôn, NHƯNG qua endpoint mới (do frontend `InstructorRevenue.jsx` coi mọi transaction là rút tiền — gộp thẳng vào getMyTransactions sẽ phá trang).

## Phase 1 — Bảo mật (S1 + S2)

1. `wallet/controller/BankController.java`: thêm `@PreAuthorize("hasRole('ADMIN')")` cho 4 endpoint thay đổi: `POST /`, `PUT /{id}`, `DELETE /{id}`, `POST /sync`. `GET` giữ nguyên (authenticated — user cần chọn ngân hàng khi gắn tài khoản). Import `org.springframework.security.access.prepost.PreAuthorize`.
2. `checkout/controller/CouponController.java`: thêm `@PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")` cho các endpoint thay đổi: `POST /`, `PUT /{id}`, `PUT /{id}/status`, `DELETE /{id}`. (Service vẫn giữ `getOwnedCoupon` chống truy cập chéo.)

## Phase 2 — Logic tiền (L1 + L2)

3. `checkout/service/PaymentService.processSuccessfulOrder` — nhánh `alreadyEnrolled` (không phải gift): sau `order.setStatus(PAID)` + `releaseCouponReservation(order)`, gọi:
   - `walletService.addDeposit(order.getAccount(), order.getTotalPrice(), String.valueOf(order.getOrderCode()))` để trả tiền vào ví;
   - `notificationService.createNotification(account, "Đã hoàn tiền vào ví", "Bạn đã sở hữu khóa ...; số tiền ... đã được cộng vào Ví Gnostica.", "REFUND_AUTO", ...)`.
   - Inject `WalletService` + `NotificationService` vào PaymentService (kiểm tra không vòng phụ thuộc: WalletService chỉ dùng PaymentRepository, không dùng PaymentService).

4. `wallet/service/WalletService.withdraw` — restructure để hết nguy cơ orphan payout:
   - **Bỏ** gọi `payoutsService.createPayout(...)` trực tiếp và `toLocalPayoutStatus` trong `withdraw`.
   - Lưu `localPayout` **PENDING** (đã có `gatewayReferenceId`, `idempotencyKey`, `submissionAttempts=0`) bằng `saveAndFlush`.
   - Gọi `payoutSubmissionService.submit(payout.getId())` (đã idempotent: `findByReference` trước khi `create`; retry ≤ 3; definitive error → FAILED).
   - Đọc lại payout bằng `findById` và trả về.
   - Xóa dependency `PayoutsService` + method `toLocalPayoutStatus` khỏi WalletService nếu không còn dùng (giữ `generateUniqueGatewayReferenceId`).
   - Inject `PayoutSubmissionService` vào WalletService.

## Phase 3 — Lịch sử giao dịch + dọn dẹp (L3 + L4 + L5)

5. L3 — thêm **endpoint mới** `GET /api/wallet/history` (KHÔNG đổi `GET /transactions` để giữ trang InstructorRevenue):
   - DTO mới `wallet/dto/response/WalletTransactionResponse`: `id`, `category` (`EARNING`|`WITHDRAWAL`|`REFUND`|`DEPOSIT`|`GIFT_REFUND`), `amount`, `createdAt`, `reference` (targetType/targetId hoặc gatewayReferenceId), `bankName`/`maskedAccountNumber` (chỉ với payout), `status` (tuỳ loại).
   - `WalletService.getMyTransactionHistory()`: gộp `walletRepository.findByAccount(account)` (type 1/4/5/6) + `payoutRepository.findByAccountOrderByCreatedAtDesc(account)`, sắp xếp theo `createdAt` desc.
   - `WalletController`: thêm `GET /history`; cập nhật `getWalletStats` dùng `transactionCount` từ history gộp.
   - Frontend: không bắt buộc đổi (endpoint cũ giữ nguyên); có thể tận dụng sau.

6. L4 — xóa dead code `WalletService.addBalance(...)`.

7. L5 — log hygiene:
   - `wallet/controller/PayoutsController.java`: thay `e.printStackTrace()` bằng logger (`@Slf4j`, `log.warn(...)`).
   - `wallet/service/BankSyncService.java`: thay `System.out/System.err` bằng SLF4J logger.

## Phase 4 — Test + xác minh

8. Test mới:
   - `checkout/service/PaymentServiceTest.java` (mới): `processSuccessfulOrder` nhánh alreadyEnrolled → order PAID + `releaseCouponReservation` + `walletService.addDeposit(account, totalPrice, ...)` + notification.
   - `wallet/service/WalletServiceTest.java` (mới): `withdraw` lưu PENDING trước rồi gọi `payoutSubmissionService.submit` (verify không gọi `payoutsService.createPayout`); trường hợp số dư không đủ → throw; (tuỳ chọn) test `getMyTransactionHistory` gộp.
   - (Tuỳ chọn) test controller annotation @PreAuthorize — nếu nặng thì bỏ qua, dựa vào compile + kiểm thử tay.
9. Chạy `mvnw.cmd test` toàn bộ → BUILD SUCCESS (đảm bảo không phá RefundServiceTest/CouponServiceTest/WalletListenerTest hiện có).

## Relevant files
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/controller/BankController.java` — S1.
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/controller/CouponController.java` — S2.
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/PaymentService.java` — L1 (inject WalletService/NotificationService).
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/WalletService.java` — L2 restructure, L3, L4.
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/PayoutSubmissionService.java` — dùng lại cho L2 (không đổi nhiều).
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/controller/WalletController.java` — L3 (endpoint /history, stats).
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/dto/response/WalletTransactionResponse.java` — L3 (mới).
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/controller/PayoutsController.java` — L5.
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/BankSyncService.java` — L5.
- Tests mới: `PaymentServiceTest.java`, `WalletServiceTest.java`.

## Verification
1. `mvnw.cmd test` → BUILD SUCCESS (toàn bộ, kể cả test cũ).
2. Thủ công (qua API/auth JWT): user USER gọi `POST /api/banks` → **403**; `POST /api/checkout/coupons` (role USER) → **403**; role INSTRUCTOR tạo coupon → OK; ADMIN tạo/sửa bank → OK; GET banks vẫn OK với user thường.
3. L1: mô phỏng order trùng đã sở hữu → order PAID, ví +totalPrice (addDeposit), coupon released.
4. L2: withdraw → local PENDING được `saveAndFlush` trước khi gọi gateway; submit qua `PayoutSubmissionService`; không còn nhánh orphan (gateway gọi sau khi đã có bản ghi local).
5. L3: `GET /api/wallet/history` trả gộp wallets + payouts theo createdAt desc; `GET /api/wallet/transactions` vẫn chỉ trả payouts (trang InstructorRevenue không vỡ).

## Scope
- Chỉ backend `gnostica-server` (+ test). Không đổi frontend trừ khi cần (L3 không bắt buộc).
- Không đổi schema DB (không migration mới cần thiết cho các hạng mục này).

## Further Considerations
1. **L3**: Nếu sau này muốn gộp hẳn vào `getMyTransactions` (thay vì endpoint mới) thì phải sửa `InstructorRevenue.jsx` để phân loại theo `category` — đề xuất để phase sau.
2. **L2**: `PayoutSubmissionService.submit` gọi network (`findByReference`) trong request của user — chấp nhận vì cần idempotency; có thể tối ưu sau bằng async.
3. **S2**: Xác nhận web UI hiện không cho USER tạo coupon (nếu có form cho USER thì cần ẩn/đổi role).

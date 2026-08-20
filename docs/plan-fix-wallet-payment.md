# Plan: Thêm thanh toán bằng Ví Gnostica (Web + Mobile)

TL;DR: Backend ĐÃ có sẵn luồng WALLET trong `OrderService.createPaymentLink` — tái sử dụng `processSuccessfulOrder` nên ghi đủ bảng (orders, order_details, payments gateway=WALLET, coupons, enrollments, wallets earning, logs, notifications) giống hệt PAYOS/VNPAY. Số dư người mua không ghi Wallet row riêng mà dùng derived balance (`sumAvailableRemain − sumPayouts − sumWalletPayments(WALLET, status=2)`). Phần việc còn lại: (1) bổ sung test backend xác nhận ghi đủ bảng + rollback khi thiếu số dư, (2) thêm UI chọn "Ví Gnostica" ở CheckoutPage web (hiển thị + validate số dư), (3) thêm selector phương thức + walletService mobile + xử lý response PAID → PaymentSuccessScreen.

Quyết định đã xác nhận (2026-08-12):
- C.1: KHÔNG migration DB — wallet tái sử dụng bảng `payments` + derived balance, nhất quán với các phương thức khác.
- C.2: KHÔNG ghi Wallet debit row riêng cho người mua (giữ nguyên thiết kế derived balance hiện tại).
- C.3: Phạm vi CHỈ thanh toán bằng ví ở checkout web + mobile; không đụng hoàn tiền/rút tiền/coupon admin.
- C.4: Backend logic đã đủ — phần việc chính là frontend + test.

## Phase 1 — Backend (xác minh + test, KHÔNG sửa logic)

1. `OrderService.java` nhánh `"WALLET".equals(paymentMethod)` (đã có): xác nhận thứ tự — check số dư qua `walletService.getWalletByAccountForPayment(account)` (lock tài khoản) → nếu thiếu throw `IllegalArgumentException("Số dư khả dụng không đủ để thanh toán!")` → rollback cả order + coupon reserved (method `@Transactional(rollbackFor = Exception.class)`); ngược lại `paymentService.saveTransaction(gateway="WALLET", status="PAID")` → `processSuccessfulOrder(order)` (defer nếu gift) → trả `PaymentLinkResponse` `status="PAID"`. Không cần sửa.
2. TẠO MỚI `OrderServiceTest.java` (`src/test/java/com/gnostica/modules/checkout/service/`):
   - `walletPayment_writesAllTables` — success: verify ghi `orders`(PAID), `payments`(gateway=WALLET, status=2, amount=totalPrice), `enrollments`, `wallets`(type=1 earning, availableAt=now+30 ngày, target ORDER_DETAIL), `logs`(REVENUE_ADDED), `coupons`(consume nếu có).
   - `walletPayment_insufficientBalance_rollsBack` — thiếu số dư → exception + rollback (không có order mới, `coupon.reserved_quantity` không tăng).
   - `walletPayment_withCoupon_consumesCoupon` — total sau giảm giá, coupon quantity −1 đúng.
   - `walletPayment_gift_deferredUntilGiftExists` — `deferImmediateSuccess=true` → KHÔNG gọi `processSuccessfulOrder` cho tới khi gift tồn tại (tương tự nhánh WALLET trong `GiftService.createGift`).
   - `walletPayment_doubleSubmit_blockedByEnrollment` — sau lần 1 thành công, lần 2 → `ALREADY_ENROLLED` (1004) do enrollment đã tạo (account lock + `assertCourseCanBePurchased`).

## Phase 2 — Web UI (gnostica-web)

3. `src/pages/order/CheckoutPage.jsx`:
   - Thêm `{ id: "WALLET", label: "Ví Gnostica", description: "Thanh toán bằng số dư Ví Gnostica", icon: Wallet, color: "text-info bg-info-soft" }` vào hằng `PAYMENT_METHODS`.
   - Import `walletService` (`@/services/payment/walletService`, đã có `getMyWallet`). Fetch số dư khi mount hoặc khi chọn WALLET → state `walletBalance` (`remain`), `walletLoading`.
   - UI: khi `paymentMethod === "WALLET"` hiển thị "Số dư khả dụng: Xđ" (và số dư sau khi trừ nếu đủ); nếu `subtotal > walletBalance` → disable nút "Xác nhận thanh toán" + cảnh báo đỏ "Số dư ví không đủ".
   - `handleSubmit`: đưa WALLET vào nhánh thanh toán được (giữ riêng check VNPAY min-10k); requestBody đã gửi `paymentMethod` (state); response `data.status === "PAID"` → `setCheckoutResult(...)` success (branch đã có sẵn).
   - Gift + wallet: branch `isGift` đã gửi `paymentMethod` → hoạt động, không cần sửa.

## Phase 3 — Mobile UI (gnostica-mobile)

4. TẠO MỚI `src/services/checkout/walletService.js`: `getMyWallet: () => api.get('/wallet/me')` → trả `{ remain, ... }` (dùng `api` từ `@/config/api`).
5. `src/screens/checkout/CheckoutScreen.jsx`:
   - Thêm state `paymentMethod` (mặc định `"PAYOS"`) + selector UI (PAYOS + WALLET; VNPAY tùy chọn).
   - Fetch số dư khi chọn WALLET (`walletService.getMyWallet()`); hiển thị; disable nút "Thanh toán" + `Alert` nếu `total > remain`.
   - `handlePay`: gửi `paymentMethod` trong payload (hiện đang hardcode `'PAYOS'`); khi `response.error === 0 && response.data?.status === "PAID"` (wallet/free) → `navigation.replace('PaymentSuccess')`; ngược lại PAYOS → `PaymentQRCode`; error 1001–1004 → Alert tương ứng.
   - (Tùy chọn) VNPAY: `Linking.openURL(response.data.checkoutUrl)`.

## Phase 4 — Xác minh

6. Backend: `mvnw.cmd test` → BUILD SUCCESS (OrderServiceTest + bộ test finance hiện có); boot server.
7. Web: `npm run build` + `vitest` (20/20 hiện tại); manual theo kịch bản.
8. Mobile: build/expo export; manual.
9. Đối chiếu DB sau thanh toán WALLET: `orders` PAID, `payments` (gateway=WALLET, status=2), `enrollments`, `wallets` (type=1) — đầy đủ như PAYOS.

## Relevant files
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/OrderService.java` — nhánh WALLET (đọc/xác nhận, không sửa logic).
- `gnostica-server/src/test/java/com/gnostica/modules/checkout/service/OrderServiceTest.java` — TẠO MỚI.
- `gnostica-web/src/pages/order/CheckoutPage.jsx` — thêm WALLET + số dư + validate.
- `gnostica-web/src/services/payment/walletService.js` — dùng lại (`getMyWallet`).
- `gnostica-mobile/src/services/checkout/walletService.js` — TẠO MỚI.
- `gnostica-mobile/src/screens/checkout/CheckoutScreen.jsx` — selector + validate + navigate.
- `gnostica-mobile/src/screens/checkout/PaymentSuccessScreen.jsx` — đích đến khi wallet PAID (đã có).

## Verification
1. `mvnw.cmd test` — OrderServiceTest + toàn bộ test finance xanh.
2. Boot server → thanh toán WALLET thủ công → kiểm tra DB ghi đủ bảng như PAYOS.
3. Web `npm run build` + vitest; mobile build; manual: WALLET đủ/thiếu số dư, gift+wallet, coupon+wallet, double-click.

## Scope
- CHỈ thanh toán bằng ví ở checkout web + mobile + test backend.
- KHÔNG migration DB, KHÔNG đổi hoàn tiền/rút tiền/coupon admin, KHÔNG sửa logic backend WALLET hiện có.
- Các bug frontend khác (InstructorRevenue formatVND, AdminUsers filter...) nằm ngoài phạm vi plan này.

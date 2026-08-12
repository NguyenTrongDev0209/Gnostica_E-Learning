# Plan: Hoàn thiện kiểm duyệt Hoàn tiền + Rút tiền (Quản Lý Yêu Cầu)

**TL;DR** — Hoàn thiện cả 2 tab **Hoàn tiền** và **Rút tiền** của trang `Quản Lý Yêu Cầu`: (1) bổ sung đủ context để admin ra quyết định (khóa học, thời điểm mua, tiến độ %, đánh dấu tự động duyệt/từ chối), (2) phân trang + lọc + sắp xếp thật từ backend, (3) gộp/đồng bộ 2 màn admin đang lặp (tab trong Yêu cầu vs `AdminTransactions`) qua shared components. Tham khảo UI user `RefundsPage.jsx`.

## User đã chốt
- Phạm vi: **Cả 2 tab Hoàn tiền + Rút tiền**.
- Ưu tiên (4): context ra quyết định; phân trang+sắp xếp thật; đánh dấu tự động duyệt/từ chối; gộp/đồng bộ 2 màn admin.

## Hiện trạng (đã rà soát)
- Backend refunds đầy đủ: `RefundService.requestRefund` (auto-approve ≤14 ngày & progress<20; auto-reject sau 30 ngày; manual còn lại), `approveRefund`/`rejectRefund`, `RefundController` (/request, /me, /all ADMIN, /{id}/approve, /{id}/reject), `RefundAutoRejectScheduler` (cron 0h). `RefundResponse` có sẵn `courseTitle`, `paidAt`, `refundCode`, `orderCode`, `amount`, `reason`, `status`, `accountName/email/avatar`.
- `Refund` entity: `refund_code` (V6), amount, reason, status (1/2/3). **Chưa có** progress/decision marker.
- Frontend: `RequestRefundsTab` đã có table (thiếu cột Khóa học) + detail modal (thiếu paidAt/progress/policy) + Duyệt/Từ chối (`AppAlertDialog` + `RefundRejectModal`) + stats charts. **Pagination GIẢ** (tải hết qua `/all`).
- `RequestWithdrawalsTab` (đã build trước): approve/reject status 6, detail modal có bank/account/ref/log metadata. Pagination giả.
- `AdminTransactions.jsx`: module refunds/withdrawals **LẶP UI + hành động** (dùng chung hook `useRefundRequests`, nhưng table/modal riêng).
- `AdminTransactionService.getWithdrawals()` tải hết payouts. `RefundRepository`/`PayoutRepository` chưa có query phân trang.

## Steps

### Phase 1 — Backend: đánh dấu quyết định + context hoàn tiền
1. `Refund.java` + migration `V10__add_refund_decision_type.sql`: `ALTER TABLE refunds ADD COLUMN decision_type VARCHAR(20)` (null khi PENDING).
2. `RefundService`:
   - `requestRefund`: auto-approve → `AUTO_APPROVED`; auto-reject → `AUTO_REJECTED`; manual → để null.
   - `approveRefund` → `MANUAL_APPROVED`; `rejectRefund` → `MANUAL_REJECTED`.
   - `RefundAutoRejectScheduler` → `AUTO_REJECTED`.
3. `RefundService.toResponse` + `RefundResponse`: thêm `progressPercent` (từ `Enrollment.progressPercent`), `daysSincePaid` (paidAt→now), `decisionType` (đã có sẵn `courseTitle`, `paidAt`).

### Phase 2 — Backend: phân trang thật
4. `RefundRepository`: `Page<Refund> findAllByOrderByCreatedAtDesc(Pageable)`, `Page<Refund> findByStatusOrderByCreatedAtDesc(Integer, Pageable)` (EntityGraph account/orderDetail/order). `RefundController /all`: nhận `page/size/status` → `ApiResponse<Page<RefundResponse>>` (user `/me` không đổi).
5. `PayoutRepository`: `Page<Payout> findAllByOrderByCreatedAtDesc(Pageable)`, `Page<Payout> findByStatusInOrderByCreatedAtDesc(List<Integer>, Pageable)` (EntityGraph). `PayoutAdminController`: thêm `GET /api/admin/payouts?page&size&status` → `Page<AdminTransactionResponse>` (tách `AdminTransactionService.toWithdrawalResponse` thành public dùng chung).

### Phase 3 — Frontend: shared components (gộp/đồng bộ 2 màn)
6. Tạo `src/components/admin/RefundModerationList.jsx`: table (STT, Mã HT, Mã ĐH, Học viên, **Khóa học**, Số tiền, Lý do, Trạng thái, Ngày, Thao tác) + server pagination + lọc status + search + detail modal (đầy đủ context Phase 4) + Duyệt/Từ chối (`AppAlertDialog` + `RefundRejectModal`). Dùng `useRefundRequests` mở rộng phân trang.
7. Tạo `src/components/admin/WithdrawalModerationList.jsx`: table + server pagination + lọc status + search + detail modal + Duyệt/Từ chối (status 6). Dùng hook mới `useWithdrawalRequests` (hoặc mở rộng `useTransactions` với page/size/status).
8. `RequestRefundsTab`/`RequestWithdrawalsTab` → wrapper mỏng (header + stats charts + render shared list).
9. `AdminTransactions.jsx`: module refunds/withdrawals render shared lists (bỏ table/actions/modal trùng); payments giữ nguyên.
10. `adminRefundService.getAllRefunds` đổi sang nhận page/size/status + trả Page; thêm `adminPayoutService.getPage` (hoặc `transactionService`) tương ứng.

### Phase 4 — Frontend: context ra quyết định
11. Refund table thêm cột **Khóa học** (`courseTitle`); detail modal hiển thị: Khóa học, Thời điểm mua (`paidAt`), Số ngày sau mua (`daysSincePaid`), Tiến độ % (`progressPercent`), policy badge (14 ngày / 20%), marker "Tự động duyệt/từ chối" (`decisionType`), lý do đầy đủ.
12. Withdrawal detail: hiển thị `rejectionReason`/`approvedBy`/`approvedAt` từ metadata thành field đọc được (không chỉ raw JSON log).

### Phase 5 — Docs & test
13. `erd_tables.md`: thêm `refunds.decision_type`; `docs/plan-fix-refund-admin-moderation.md` mới; repo memory.
14. Test: `RefundServiceTest` (decisionType auto/manual, approve/reject), pagination test; `mvnw compile` + test; `npm run build`.

## Relevant files
- Backend: `core/model/Refund.java`, `core/constant/RefundStatus.java` (không đổi), `core/repository/{RefundRepository,PayoutRepository}.java`, `checkout/service/RefundService.java`, `checkout/controller/RefundController.java`, `checkout/dto/response/RefundResponse.java`, `checkout/scheduler/RefundAutoRejectScheduler.java`, `wallet/controller/PayoutAdminController.java`, `checkout/service/AdminTransactionService.java`, `db/migration/V10__add_refund_decision_type.sql` *(mới)*
- Frontend: `src/components/admin/{RefundModerationList,WithdrawalModerationList}.jsx` *(mới)*, `src/pages/admin/components/{RequestRefundsTab,RequestWithdrawalsTab}.jsx`, `src/pages/admin/AdminTransactions.jsx`, `src/hooks/payment/{useRefundRequests,useTransactions}.js` + `useWithdrawalRequests.js` *(mới)*, `src/services/payment/{adminRefundService,adminPayoutService}.js`
- Docs: `erd_tables.md`, `docs/plan-fix-refund-admin-moderation.md` *(mới)*

## Verification
1. `mvnw compile` sạch; `mvnw test -Dtest="RefundServiceTest,..."` xanh.
2. Web: `npm run build` OK; chạy thử 2 tab: phân trang thật, lọc status, chi tiết có Khóa học/paidAt/progress/marker auto, Duyệt/Từ chối hoạt động & list refresh.
3. `AdminTransactions` refunds/withdrawals render **giống hệt** Request*Tab (đồng bộ).
4. Scheduler auto-reject vẫn chạy và đánh dấu `AUTO_REJECTED`.

## Decisions
- `decision_type` là cột mới (V10) để đánh dấu auto **chính xác** (không thể suy luận: admin duyệt thủ công 1 đơn đủ điều kiện ≤14d/<20% sẽ giống auto).
- Pagination server-side; `/me` (user) và payments module của `AdminTransactions` không đổi.
- Gộp màn bằng shared components (single source of truth); giữ 2 màn nhưng render cùng component.
- Phạm vi: chỉ Hoàn tiền + Rút tiền (không đụng incidents/reports/payments logic).

## Further Considerations
1. N+1 khi tính progress/daysSincePaid trong `toResponse` cho list — có thể chấp nhận (admin list nhỏ) hoặc tối ưu batch. Đề xuất: chấp nhận cho Phase này.
2. Có nên thêm bộ lọc "Tự động/Thủ công" (`decisionType`) ở tab Hoàn tiền? — đề xuất: **có**.
3. Khi gộp `AdminTransactions`, amount-range filter mất tác dụng với refunds/withdrawals — đề xuất đẩy amount range vào shared list để giữ UX hiện tại.

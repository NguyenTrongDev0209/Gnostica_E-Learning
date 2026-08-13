# Plan: JSONB metadata + rename payout_code

**TL;DR** — Viết lại migration `V9` (chưa nạp DB, sửa an toàn): **(1)** đổi tên cột `gateway_reference_id → payout_code` + rename unique index, **(2)** thay 3 cột duyệt thủ công (`approved_by/approved_at/rejection_reason`) bằng **1 cột `metadata JSONB`** (chỉ lệnh ≥ 5M mới có dữ liệu, hết cột null rải rác). Frontend không đổi.

## Quyết định đã chốt (user)
- Expose metadata lên admin: **CÓ** → `AdminTransactionResponse.log = payout.getMetadata()` (modal admin hiện ai duyệt/khi nào/lý do từ chối).
- Entity convenience getters: **KHÔNG** → dùng constants `PayoutMetadataKeys` + helper đọc map, cập nhật luôn test.
- Tên cột mới: `payout_code`; `gateway_payout_id` giữ nguyên.

## Ảnh hưởng rename (đã xác minh)
- **Chỉ backend** 6 file Java: `Payout`, `PayoutRepository`, `WalletService`, `PayoutSubmissionService`, `PayoutReconciliationScheduler`, `AdminTransactionService`
- **Frontend: 0 ảnh hưởng** — không thấy tên cột; API giữ nguyên (`reference`, `transactionCode`)
- **PayOS không đổi**: vẫn gửi `request.setReferenceId(payout.getPayoutCode())` — gateway gọi là `referenceId`
- **`V3`/`V4` không đụng** (đã nạp). Postgres tự cập nhật predicate của partial unique index khi rename; dữ liệu cũ ("RT...") giữ nguyên

## Các bước

### Phase A — Migration · *bước 1 chặn tất cả*
1. Viết lại `V9__add_payout_manual_approval.sql`:
   - `ALTER TABLE payouts RENAME COLUMN gateway_reference_id TO payout_code;`
   - `ALTER INDEX IF EXISTS uq_payouts_gateway_reference_id RENAME TO uq_payouts_payout_code;`
   - `ALTER TABLE payouts ADD COLUMN metadata JSONB;`
   - (bỏ `approved_by`/`approved_at`/`rejection_reason`)

### Phase B — Entity · *phụ thuộc 1*
2. `Payout.java`:
   - `gatewayReferenceId` → `payoutCode` (`@Column(name = "payout_code", unique = true)`)
   - **XÓA** `approvedBy`/`approvedAt`/`rejectionReason`
   - **THÊM** `Map<String, Object> metadata` với `@JdbcTypeCode(SqlTypes.JSON)` + `@Column(columnDefinition = "jsonb")` (pattern `Payment.payload`)
3. Tạo mới `com.gnostica.core.constant.PayoutMetadataKeys`: `APPROVED_BY = "approvedBy"`, `APPROVED_AT = "approvedAt"`, `REJECTION_REASON = "rejectionReason"`

### Phase C — Rename cascade (backend) · *phụ thuộc 2, chạy song song*
4. `PayoutRepository.java`: `findByGatewayReferenceId` → `findByPayoutCode`; `existsByGatewayReferenceId` → `existsByPayoutCode`
5. `WalletService.java`:
   - L155 `.reference(p.getGatewayReferenceId())` → `.reference(p.getPayoutCode())`
   - L321 `generateUniqueGatewayReferenceId()` → `generateUniquePayoutCode()`
   - L331 `setGatewayReferenceId` → `setPayoutCode`
   - L349–354 method + `existsByGatewayReferenceId` → `existsByPayoutCode` + cập nhật comment
6. `PayoutSubmissionService.java`:
   - L33 `findByReference(payout.getGatewayReferenceId())` → `payout.getPayoutCode()`
   - L40 `request.setReferenceId(payout.getGatewayReferenceId())` → `payout.getPayoutCode()`
   - L46 `payout.setGatewayReferenceId(remote.getReferenceId())` → `payout.setPayoutCode(remote.getReferenceId())`
7. `PayoutReconciliationScheduler.java` L53: `local.getGatewayReferenceId()` → `local.getPayoutCode()`
8. `AdminTransactionService.java` L110: `firstNonBlank(payout.getGatewayReferenceId(), ...)` → `firstNonBlank(payout.getPayoutCode(), ...)`

### Phase D — Metadata usage · *phụ thuộc 2, chạy song song với C*
9. `PayoutAdminService.approve`: `metadata.put(APPROVED_BY, admin.getId().toString())`; `metadata.put(APPROVED_AT, LocalDateTime.now().toString())`; `metadata.remove(REJECTION_REASON)`; status → PENDING; saveAndFlush; submit.
10. `PayoutAdminService.reject`: `metadata.put(REJECTION_REASON, reason)` (truncate 500); status → REJECTED.
11. `AdminTransactionService.toWithdrawalResponse`:
    - L127 `.ref(...)` → `firstNonBlank(metadataValue(payout, REJECTION_REASON), payout.getLastSubmissionError())` (thêm helper `metadataValue(Payout, String)`)
    - thêm `.log(payout.getMetadata())` (expose metadata lên admin modal)

### Phase E — Test & verify · *phụ thuộc C+D*
12. `PayoutAdminServiceTest.java`: đổi assertion từ `getApprovedBy()/getApprovedAt()/getRejectionReason()` → đọc `payout.getMetadata()` (keys từ `PayoutMetadataKeys`)
13. Chạy: `mvnw compile`; `mvnw test -Dtest="WalletServiceTest,PayoutAdminServiceTest,AdminStatsServiceImplTest"`
14. Boot server → Flyway nạp V9 → `\d payouts`: `payout_code` + `metadata jsonb`, dữ liệu cũ giữ nguyên, index `uq_payouts_payout_code`
15. Manual test (4 trường hợp: <5M, ≥5M, duyệt, từ chối)
16. `npm run build` web (chạy lại cho chắc — frontend không đổi)

### Phase F — Docs
17. `gnostica-server/erd_tables.md`: `gateway_reference_id` → `payout_code`; thay 3 cột (14–16) bằng `metadata JSONB`
18. `docs/plan-fix-finance-audit.md`: cập nhật tham chiếu `gatewayReferenceId` (historical doc — cập nhật ghi chú)
19. Cập nhật `/memories/repo/finance-modules.md` (bổ sung rename + metadata)

## Relevant files
- `gnostica-server/src/main/resources/db/migration/V9__add_payout_manual_approval.sql` (viết lại)
- `gnostica-server/src/main/java/com/gnostica/core/model/Payout.java`
- `gnostica-server/src/main/java/com/gnostica/core/constant/PayoutMetadataKeys.java` (mới)
- `gnostica-server/src/main/java/com/gnostica/core/repository/PayoutRepository.java`
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/WalletService.java`
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/PayoutSubmissionService.java`
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/PayoutReconciliationScheduler.java`
- `gnostica-server/src/main/java/com/gnostica/modules/wallet/service/PayoutAdminService.java`
- `gnostica-server/src/main/java/com/gnostica/modules/checkout/service/AdminTransactionService.java`
- `gnostica-server/src/test/java/com/gnostica/modules/wallet/service/PayoutAdminServiceTest.java`
- `gnostica-server/erd_tables.md`

## Verification
1. `mvnw compile` sạch
2. `mvnw test -Dtest="WalletServiceTest,PayoutAdminServiceTest,AdminStatsServiceImplTest"` xanh
3. Boot → `\d payouts` thấy `payout_code` + `metadata jsonb`, dữ liệu cũ nguyên, index `uq_payouts_payout_code`
4. Manual: rút <5M → tự submit; ≥5M → status 6, metadata rỗng; duyệt → metadata có `approvedBy/approvedAt` + submit; từ chối → `rejectionReason` + status 5
5. `npm run build` web

## Scope
- **In**: rename cột (backend), metadata JSONB, expose metadata admin, test/docs
- **Out**: không đổi frontend, không đổi protocol PayOS, không đổi các status-list khóa quỹ (`1,2,3,6`)

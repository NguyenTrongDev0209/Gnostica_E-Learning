# Plan: Thêm biểu đồ thống kê vào 4 sub-module của "Yêu cầu" (UI lấy ý tưởng từ Tổng quan)

**TL;DR** — Thêm **API stats riêng ở backend** cung cấp dữ liệu xu hướng theo tháng, phân bố trạng thái, loại, mức ưu tiên cho cả 4 sub-module (Sự cố / Hoàn tiền / Rút tiền / Báo cáo). Phía frontend xây **bộ component biểu đồ dùng chung** (lấy pattern `AppCard` + `ChartContainer` + recharts từ `AdminDashboard.jsx`) và gắn vào tab "Thống kê" của từng sub-module.

**Phát hiện chính**
- Module Yêu cầu hiện chỉ có **stat cards đếm theo trạng thái**, chưa có biểu đồ nào (`RequestIncidentsTab.jsx`… có inner tab `STATISTICS`/`LIST`).
- Nguồn ý tưởng UI: `AdminDashboard.jsx` (ComposedChart stacked bar + line, donut, area gradient) + các component tái sử dụng `AppChart`, `LineChart`, `AppCard`, `AppSelect`.
- Backend: group theo tháng **trong Java** (pattern `DashboardServiceImpl`), PostgreSQL, `ApiResponse<T>`, admin-only.

**Các bước**

*Giai đoạn 1 — Backend (gnostica-server)*
1. Thêm DTO dùng chung: `AdminStatsResponse`, `TrendPointDTO` (month, total, amount, statusCounts), `KeyCountDTO` (key, label, count).
2. Thêm query projection nhẹ vào 4 repository (`SupportRepository`, `RefundRepository`, `PayoutRepository`, `ReportRepository`) — trả `List<Object[]>` từ `createdAt >= :start` (*có thể chạy song song với bước 1*).
3. Tạo `AdminStatsService` + `AdminStatsServiceImpl`: group theo tháng, **fill tháng thiếu = 0**, map label trạng thái/loại/ưu tiên, sum `amount` (refund/payout), clamp `months` 1–120 (*phụ thuộc bước 1, 2*).
4. Tạo `AdminStatsController` tại `/api/admin/stats` (admin-only) với 4 endpoint gộp: `supports`, `refunds`, `withdrawals`, `thread-reports` — mỗi tab chỉ gọi 1 lần (*phụ thuộc bước 3*).
5. Viết `AdminStatsServiceImplTest` (Mockito): grouping, zero-fill, đếm, sum, clamp, dữ liệu rỗng, row null (*phụ thuộc bước 3*).

*Giai đoạn 2 — Frontend (gnostica-web)*
6. Thêm `requestStatsService.js` + hook `useRequestStats.js` (pattern `useDashboard`) (*song song với giai đoạn 1*).
7. Tạo `RequestStatCharts.jsx` với 3 component dùng chung: `RequestTrendChart` (stacked bar theo status + bộ lọc tháng 3/6/12/24), `RequestStatusDonut`, `RequestCategoryBar`.
8. Wire vào 4 sub-tab: Sự cố (Trend + Donut + Loại + Mức ưu tiên), Hoàn tiền & Rút tiền (Trend kèm amount + Donut), Báo cáo (Trend + Donut + Loại vi phạm) (*phụ thuộc bước 6, 7*).

**Relevant files**
- Thêm BE: `gnostica-server/src/main/java/com/gnostica/modules/adminstats/**` (+ test)
- Sửa BE: `core/repository/{SupportRepository,RefundRepository,PayoutRepository,ReportRepository}.java`
- Thêm FE: `gnostica-web/src/services/admin/requestStatsService.js`, `src/hooks/admin/useRequestStats.js`, `src/components/common/composite/RequestStatCharts.jsx`
- Sửa FE: `src/pages/admin/components/Request{Incidents,Refunds,Withdrawals,Reports}Tab.jsx`

**Verification**
1. `mvn -f gnostica-server/pom.xml test` + `package`; curl 4 endpoint với token admin (count khớp seed, user thường → 403).
2. `npm --prefix gnostica-web run lint` + `build`; chạy dev vào `/admin/requests?tab=...` kiểm tra biểu đồ, donut khớp stat cards, đổi months filter, empty state.

**Decisions**
- API stats backend; group trong Java (nhất quán codebase, dễ test).
- 1 endpoint gộp/module; component dùng chung cho cả 4 sub-module.
- Báo cáo chỉ đếm `targetType='THREAD'` (khớp trang hiện tại).
- **Ngoài scope**: tab Danh sách, trang `/admin/transactions` (trùng logic refund/withdrawal), mobile, mock data.

**Further Considerations**
1. Nếu sau này muốn thống kê toàn bộ loại report (COURSE/COMMENT/REVIEW/THREAD) → thêm param `targetType`. *(Khuyến nghị: giữ THREAD)*
2. Nếu dữ liệu lớn → chuyển sang native SQL `GROUP BY` thay vì group trong Java.

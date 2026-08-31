# Plan: Hoàn thiện lọc thời gian Dashboard Admin

**TL;DR**: Các bộ lọc thời gian trên 5 biểu đồ dashboard admin hiện đang là no-op, và 2 biểu đồ dropdown khác có gọi `onFilterChange` nhưng backend bỏ qua tham số. Backend luôn trả 12 cột tháng cố định (T1→T12). Giải pháp: backend nhận **khoảng ngày** `start`+`end` và tự suy luận đơn vị cột (ngày/tuần/tháng/quý) theo độ dài range; frontend nối callback `ChartDateFilters` → hook → service → API.

**Steps**

**Phase 1 — Backend (engine chia cột + endpoints)**
1. Trong `DashboardServiceImpl`: thêm enum `Granularity {DAY, WEEK, MONTH, QUARTER}`, helper `resolveGranularity(start,end)` và `buildBuckets(start,end,g)` (luôn pre-fill 0 cho mọi cột).
2. Đổi field `month` → `label` ở 4 DTO: `RevenueMonthDTO`, `MemberGrowthDTO`, `MonthlyViolationDTO`, `MonthlyUserRatingDTO` (chỉ dùng riêng dashboard nên đổi an toàn).
3. `DashboardController`: `/revenue`, `/member-growth`, `/violations`, `/user-ratings` nhận `start`, `end` (parse `LocalDateTime`, nullable → fallback "Năm nay"); giữ `period` cho `/top-instructors`, `/student-productivity`.
4. `DashboardServiceImpl`: viết lại 4 hàm time-series để truy vấn `[start,end)` rồi gom theo bucket; làm cho `getTopInstructors` & `getStudentProductivity` thực sự lọc theo `period`.
5. Bổ sung method date-range cho `EnrollmentRepository`, `RefundRepository`.

**Phase 2 — Frontend (service/hook/wiring)**
6. `dashboardService.js`: đổi 4 hàm time-series sang nhận `{ start, end }`.
7. `useDashboard.js`: đổi signature fetch nhận `range`, thêm slot `instructorRevenueData` + `fetchInstructorRevenue` riêng (vì 2 biểu đồ doanh thu độc lập).
8. `ChartDateFilters`: thêm prop tùy chọn `onRangeChange({start,end,preset})` — gọi 1 lần khi đủ cả start+end, **non-breaking** để instructor dashboard không bị ảnh hưởng.
9. `AdminDashboard.jsx`: nối 5 biểu đồ với fetch tương ứng; đổi `dataKey="month"` → `dataKey="label"`; sửa mock data fallback.

**Phase 3 — Kiểm thử**
- Backend: compile + gọi curl với range 7 ngày / 3 tháng / 1 năm / 3 năm → kiểm tra số cột và nhãn.
- Frontend: tương tác từng filter (preset + custom range), kiểm tra cột đổi, dữ liệu rỗng, range lệch năm.
- Regression: instructor dashboard vẫn chạy bình thường.

**Relevant files**
- `gnostica-server/src/main/java/com/gnostica/modules/dashboard/service/impl/DashboardServiceImpl.java` — logic chính
- `gnostica-server/src/main/java/com/gnostica/modules/dashboard/controller/DashboardController.java` — tham số `start`/`end`
- `gnostica-server/src/main/java/com/gnostica/modules/dashboard/dto/response/*.java` — field `label`
- `gnostica-server/src/main/java/com/gnostica/core/repository/{EnrollmentRepository,RefundRepository}.java`
- `gnostica-web/src/services/admin/dashboardService.js`
- `gnostica-web/src/hooks/dashboard/useDashboard.js`
- `gnostica-web/src/components/common/composite/DataFilter.jsx`
- `gnostica-web/src/pages/admin/AdminDashboard.jsx`

**Decisions**
- Granularity theo bạn chọn: ≤7 ngày → ngày; ≤3 tháng → tuần; ≤2 năm → tháng; >2 năm → quý.
- Mỗi biểu đồ độc lập → 2 biểu đồ doanh thu dùng 2 slot dữ liệu riêng.
- Thẻ tổng quan đầu trang giữ nguyên (toàn nền tảng), không lọc.
- Top giảng viên & Năng suất học viên: giữ dropdown preset, chỉ nối backend.
- Phạm vi: chỉ `/admin`, không đụng instructor dashboard.

**Further Considerations**
1. Timezone: `ChartDateFilters` gửi giờ địa phương, backend parse `LocalDateTime` — cần thống nhất để tránh lệch ngày.
2. Hiện gom bucket trong memory (dữ liệu seed nhỏ) — đủ tốt; có thể tối ưu SQL group-by sau nếu dữ liệu lớn.
3. Range >5 năm → ~40 cột quý (chấp nhận được); nếu bạn muốn có thể thêm bậc YEAR cho range rất dài.

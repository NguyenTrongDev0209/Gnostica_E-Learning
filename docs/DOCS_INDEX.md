# Hướng dẫn Tài liệu Dự án Gnostica E-Learning 📚

> **Mục đích:** File này là bản đồ (index) cho toàn bộ tài liệu dự án. AI hoặc developer mới nên đọc file này đầu tiên để biết cần đọc file nào cho mục đích gì.

---

## Danh sách Tài liệu

| # | File | Mô tả | Khi nào đọc |
|---|------|-------|-------------|
| 0 | [README.md](README.md) | Giới thiệu dự án, công nghệ, cách chạy nhanh | Bắt đầu tìm hiểu dự án |
| 1 | [ARCHITECTURE.md](ARCHITECTURE.md) | Kiến trúc tổng quan hệ thống, sơ đồ, luồng dữ liệu, cách các phân hệ giao tiếp | Hiểu bức tranh toàn cảnh |
| 2 | [BACKEND_API.md](BACKEND_API.md) | Chi tiết Backend: packages, endpoints, entities, security, config | Viết báo cáo Backend, bổ sung API docs |
| 3 | [FRONTEND_WEB.md](FRONTEND_WEB.md) | Chi tiết Web: công nghệ, cấu trúc, pages, routing, state, services | Viết báo cáo Frontend Web |
| 4 | [MOBILE_APP.md](MOBILE_APP.md) | Chi tiết Mobile: React Native, navigation, screens, so sánh với web | Viết báo cáo Mobile App |
| 5 | [DATABASE.md](DATABASE.md) | Kiến trúc DB: nhóm bảng, quan hệ, thiết kế, PostgreSQL + Redis + MongoDB | Viết báo cáo CSDL, hiểu ERD |
| 6 | [FEATURES.md](FEATURES.md) | Tính năng chi tiết theo vai trò (Guest, Learner, Instructor, Admin) | Viết tài liệu tính năng, use cases |
| 7 | [DEPLOYMENT.md](DEPLOYMENT.md) | Triển khai: Docker, Cloudflare Tunnel, CI/CD, production config | Viết báo cáo triển khai, DevOps |
| 8 | [gnostica-server/erd_tables.md](gnostica-server/erd_tables.md) | ERD chi tiết: 48 bảng, từng cột, kiểu dữ liệu, constraints, ghi chú | Tra cứu cấu trúc DB cụ thể |
| 9 | [gnostica-web/README.md](gnostica-web/README.md) | Hướng dẫn riêng cho Web: cấu hình env, Google OAuth, troubleshooting | Setup/debug Web App |
| 10 | [gnostica-mobile/README.md](gnostica-mobile/README.md) | Hướng dẫn riêng cho Mobile: cấu hình env, IP LAN, Google OAuth | Setup/debug Mobile App |

---

## Thống kê Dự án

| Metric | Giá trị |
|--------|---------|
| **Tổng số phân hệ** | 3 (Server, Web, Mobile) |
| **Backend** | Spring Boot 4.x, Java 17 |
| **Web** | React 19, Vite 7, Tailwind CSS 4 |
| **Mobile** | React Native 0.81, Expo SDK 54 |
| **Database** | PostgreSQL 16 (48 bảng) + Redis + MongoDB |
| **Tổng số trang Web** | ~50 trang (public + private) |
| **Tổng số Java files** | 280+ files |
| **Tổng số API service files** | 33 files (web services layer) |
| **Payment Gateways** | PayOS, VNPay |
| **Media Storage** | Cloudinary (ảnh), Bunny.net (video + docs) |
| **AI Integration** | OpenRouter (Gemini), DeepSeek (fallback) |
| **CI/CD** | GitHub Actions |
| **Production Hosting** | Docker Compose + Cloudflare Tunnel |
| **Domain** | gnostica.io.vn |

---

## Gợi ý Thứ tự Đọc

### Cho AI hoàn thiện báo cáo tổng quan:
1. `README.md` → 2. `ARCHITECTURE.md` → 3. `FEATURES.md`

### Cho AI hoàn thiện báo cáo kỹ thuật Backend:
1. `BACKEND_API.md` → 2. `DATABASE.md` → 3. `gnostica-server/erd_tables.md`

### Cho AI hoàn thiện báo cáo kỹ thuật Frontend:
1. `FRONTEND_WEB.md` → 2. `MOBILE_APP.md`

### Cho AI hoàn thiện báo cáo triển khai:
1. `DEPLOYMENT.md` → 2. `ARCHITECTURE.md` (phần giao tiếp)

### Cho AI viết Use Case / User Stories:
1. `FEATURES.md` → 2. `DATABASE.md` (hiểu data model)

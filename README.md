# Gnostica E-Learning Platform 🎓

<div align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br/>

**Gnostica** là một nền tảng học trực tuyến (E-Learning) full-stack toàn diện và chuyên nghiệp, được thiết kế để phục vụ 3 nhóm đối tượng chính: **Học viên (Learner)**, **Giảng viên (Instructor)** và **Quản trị viên (Admin)**. Hệ thống bao gồm 3 phân hệ (Backend API, Web App, Mobile App) hoạt động trên một kiến trúc dữ liệu và logic nhất quán.

---

## 📑 Mục lục
1. [Giới thiệu dự án](#-giới-thiệu-dự-án)
2. [Cấu trúc Monorepo](#-cấu-trúc-monorepo)
3. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
4. [Kiến trúc Dữ liệu (ERD)](#-kiến-trúc-dữ-liệu-erd)
5. [Tính năng chi tiết](#-tính-năng-chi-tiết)
6. [Hướng dẫn Cài đặt & Chạy dự án](#-hướng-dẫn-cài-đặt--chạy-dự-án)
7. [Tác giả & Bản quyền](#-tác-giả--bản-quyền)

---

## 🚀 Giới thiệu dự án

Gnostica giải quyết bài toán quản lý và phân phối các khóa học trực tuyến. Nền tảng không chỉ cung cấp tính năng học qua video/tài liệu, mà còn tích hợp hệ thống làm bài kiểm tra (Quiz), diễn đàn thảo luận (Forum), chứng chỉ (Certificate), hệ thống thanh toán tự động (PayOS), và quản lý doanh thu/rút tiền cho giảng viên.

---

## 🏗 Cấu trúc Monorepo

Dự án được tổ chức theo dạng Monorepo, giúp dễ dàng quản lý mã nguồn, đồng bộ logic và tài liệu:

```text
Gnostica_E-Learning/
├── gnostica-server/     # Backend REST API (Spring Boot)
├── gnostica-web/        # Web Application (React 19 + Vite + Tailwind CSS 4)
└── gnostica-mobile/     # Mobile Application (React Native + Expo SDK 54)
```

---

## 💻 Công nghệ sử dụng

### 1. `gnostica-server` (Backend API)
Được xây dựng bằng Java 17 và Spring Boot 3, cung cấp các RESTful API bảo mật và hiệu suất cao.

- **Core Framework:** Spring Boot (Web, Data JPA, Data MongoDB, Validation, Mail, WebSocket).
- **Database:** PostgreSQL (Lưu trữ chính), Redis (Caching), MongoDB (Dữ liệu phi cấu trúc nếu có).
- **Security:** Spring Security, JWT (JSON Web Token), OAuth2 Client (Đăng nhập Google/Facebook).
- **Payment Gateway:** PayOS (Thanh toán qua mã QR tự động).
- **Media Storage:** Cloudinary (Lưu trữ ảnh, video).
- **Database Migration:** Flyway (Quản lý version database).
- **Document Processing:** Apache PDFBox & Apache POI (Xử lý file chứng chỉ, tài liệu).
- **Lombok & MapStruct:** Tối ưu hóa code boiler-plate và mapping DTO.

### 2. `gnostica-web` (Web Application)
Giao diện người dùng web hiện đại, tối ưu UX/UI và Responsive.

- **Core:** React 19, Vite (Build tool siêu tốc).
- **Styling & UI:** Tailwind CSS v4, Shadcn UI (Radix UI), Framer Motion (Animations), Tailwind-merge.
- **State Management & Data Fetching:** Zustand (Global State), React Query v5 (Server State), Axios.
- **Forms & Validation:** React Hook Form, Zod.
- **Routing:** React Router DOM v7.
- **Rich Text & Media:** React Quill New, React-easy-crop, Canvas-confetti, Embla Carousel.
- **Real-time:** SockJS-client, StompJS (Nhận thông báo, Chat).
- **Data Visualization:** Recharts (Vẽ biểu đồ thống kê cho Admin/Instructor).
- **PDF/Image Generation:** html2canvas, jsPDF (Tạo chứng chỉ).
- **Icons & Typography:** Lucide React, Fontsource (Geist, Inter).

### 3. `gnostica-mobile` (Mobile Application)
Ứng dụng di động đa nền tảng (iOS & Android).

- **Core:** React Native 0.81, Expo SDK 54.
- **Styling:** NativeWind v4 (Dùng Tailwind trong React Native).
- **Navigation:** React Navigation v7 (Native Stack, Bottom Tabs).
- **UI Components:** Gluestack UI.
- **Animations:** React Native Reanimated.
- **Video Player:** Expo Video / React Native Video.
- **Icons:** Lucide React Native.

---

## 🗄 Kiến trúc Dữ liệu (ERD)

Hệ thống cơ sở dữ liệu bao gồm **41 bảng**, được thiết kế chặt chẽ và chuẩn hóa để đáp ứng nghiệp vụ phức tạp:

- **Quản lý Tài khoản (Accounts, Roles, Devices, Logs):** Quản lý người dùng, phân quyền, quản lý phiên đăng nhập thiết bị.
- **Quản lý Khóa học (Courses, Modules, Lessons, Categories, Attachments):** Hỗ trợ cơ chế **Versioning** (Bản nháp/Đã xuất bản) giúp giảng viên chỉnh sửa khóa học mà không ảnh hưởng đến người đang học.
- **Quản lý Bài thi & Câu hỏi (Quizzes, Questions, Quiz_Questions, Quiz_Results):** Cho phép tạo bài kiểm tra, cấu hình số điểm đỗ (`passing_score`), số lần thử (`max_attempts`).
- **Tương tác Xã hội & Diễn đàn (Threads, Comments, Topics, Votes, Hashtags, Follows, Reviews):** Môi trường cộng đồng, đánh giá sao, bình luận.
- **Tài chính & Thanh toán (Orders, Order_Details, Payments, Coupons, Coupon_Rules):** Giỏ hàng, áp dụng mã giảm giá phức tạp, thanh toán QR tự động.
- **Doanh thu & Ví giảng viên (Wallets, Payouts, Commissions, Account_Banks, Banks):** Chia sẻ doanh thu tự động, quản lý số dư ví giảng viên, yêu cầu rút tiền về tài khoản ngân hàng.
- **Học tập & Chứng chỉ (Enrollments, Lesson_Progress, Cert_Requirements, Favorites):** Theo dõi tiến độ học tập chi tiết, cấp phát chứng chỉ dựa trên điều kiện hoàn thành khóa học.

---

## 🌟 Tính năng chi tiết

### 👨‍🎓 Dành cho Học viên (Learner)
*   **Trang chủ & Khám phá:** Khám phá khóa học nổi bật, xem theo danh mục.
*   **Tìm kiếm thông minh:** Tìm kiếm khóa học bằng công cụ Fuzzy search (`fuse.js`).
*   **Giỏ hàng & Thanh toán:** Thêm khóa học vào giỏ hàng, áp dụng mã giảm giá (Coupon), thanh toán cực nhanh qua mã QR tự động xác nhận (PayOS).
*   **Không gian học tập (Learning Space):** 
    *   Trình phát video mượt mà.
    *   Theo dõi tiến độ học tập (Lưu bài học gần nhất).
    *   Tải tài liệu đính kèm.
*   **Làm bài kiểm tra (Quiz):** Làm bài trắc nghiệm, xem điểm và đáp án chi tiết.
*   **Chứng chỉ (Certificate):** Tự động cấp chứng chỉ định dạng PDF/Image sau khi hoàn thành tối thiểu tiến độ quy định và qua các bài Quiz bắt buộc.
*   **Cộng đồng (Forum & Q&A):** Thảo luận, đặt câu hỏi cho giảng viên và học viên khác.
*   **Hồ sơ cá nhân:** Cập nhật thông tin, thay đổi avatar (Cắt ảnh trực tiếp), quản lý Wishlist.
*   **Nhận thông báo Real-time:** Nhận thông báo qua WebSocket khi có tin mới, có người reply comment.

### 👨‍🏫 Dành cho Giảng viên (Instructor)
*   **Dashboard Thống kê:** Bảng điều khiển trực quan (dùng `recharts`) thống kê doanh thu, số lượng học viên, đánh giá khóa học theo từng tháng/tuần.
*   **Quản lý Khóa học (Course Management):** 
    *   Tạo/Sửa khóa học với trình soạn thảo văn bản giàu tính năng (Rich Text).
    *   Cơ chế **Draft/Publish**: Sửa chữa giáo trình mà không ảnh hưởng học viên hiện tại.
    *   Upload video và tài liệu an toàn.
*   **Quản lý Bài thi:** Tạo bộ câu hỏi, thiết lập cấu hình bài kiểm tra nâng cao.
*   **Quản lý Khuyến mãi:** Tạo mã giảm giá (Coupons) linh hoạt cho các khóa học của mình.
*   **Quản lý Tài chính (Ví & Rút tiền):** 
    *   Theo dõi số dư trong ví (`Wallets`).
    *   Thêm tài khoản ngân hàng liên kết (`Account_Banks`).
    *   Tạo yêu cầu rút tiền cực kỳ minh bạch (`Payouts`).
*   **Tương tác Học viên:** Trả lời đánh giá (Reviews), hỗ trợ giải đáp thắc mắc.

### 🛡 Dành cho Quản trị viên (Admin)
*   **Dashboard Tổng quan:** Theo dõi tình hình toàn hệ thống, tổng doanh thu nền tảng, số lượt đăng ký mới.
*   **Quản lý Người dùng:** Khóa/mở khóa tài khoản (Banned/Active), xem và phân quyền hệ thống.
*   **Kiểm duyệt Khóa học:** Phê duyệt các khóa học do giảng viên đăng lên (Pending -> Published), hoặc từ chối (Rejected) với lý do cụ thể.
*   **Quản lý Tài chính:** Xử lý các yêu cầu rút tiền của giảng viên. Thiết lập tỉ lệ chia sẻ doanh thu (`Commissions`) cho hệ thống.
*   **Quản lý Danh mục (Categories) & Banners:** Cấu hình giao diện, thêm/sửa/xóa danh mục, banner.
*   **Quản lý Diễn đàn & Báo cáo:** Kiểm duyệt nội dung thảo luận, xử lý các báo cáo vi phạm (`Reports`) từ cộng đồng.
*   **Hệ thống Cấu hình chung:** Chỉnh sửa các thông số cấu hình hệ thống linh hoạt (`System_Configs`).

### 📱 Nền tảng Mobile (iOS & Android)
Ứng dụng di động `gnostica-mobile` mang lại trải nghiệm Native mượt mà:
*   Đầy đủ tính năng dành cho Học viên: Mua khóa học, xem video bài giảng, làm quiz, tải chứng chỉ.
*   Giao diện thân thiện, sử dụng `NativeWind` (Tailwind) và `Gluestack UI` đảm bảo tính đồng bộ hoàn toàn với Web.

---

## 🛠 Hướng dẫn Cài đặt & Chạy dự án

### Điều kiện tiên quyết
*   **Java:** JDK 17+ (Dành cho Backend) & Maven
*   **Node.js:** Phiên bản 18+ (Dành cho Web & Mobile)
*   **Cơ sở dữ liệu:** PostgreSQL, Redis.
*   **Mobile Tool:** Cài đặt Expo CLI (`npm install -g expo-cli`) và ứng dụng Expo Go trên thiết bị.

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd Gnostica_E-Learning
```

### Bước 2: Cài đặt và Chạy Backend (`gnostica-server`)
```bash
cd gnostica-server
```
Cấu hình file `src/main/resources/application.properties` hoặc file `.env`:
*   Cơ sở dữ liệu: `spring.datasource.url`, `username`, `password` (PostgreSQL)
*   Redis: `spring.data.redis.host`, `port`
*   PayOS: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
*   Cloudinary: `CLOUDINARY_URL`
*   Spring Security: JWT Secret Key, OAuth2 Client Keys (Google, Facebook).

Khởi chạy server:
```bash
./mvnw spring-boot:run
```
> Server sẽ khởi chạy tại: `http://localhost:8080`

### Bước 3: Cài đặt và Chạy Web App (`gnostica-web`)
```bash
cd gnostica-web
npm install
```
Tạo file `.env` (tham khảo `.env.example`) và cấu hình:
```env
VITE_APP_ENV=development
```
Khởi chạy ứng dụng Web:
```bash
npm run dev
```
> Ứng dụng Web sẽ khởi chạy tại: `http://localhost:5173`

### Bước 4: Cài đặt và Chạy Mobile App (`gnostica-mobile`)
```bash
cd gnostica-mobile
npm install
```
Tạo file `.env` (tham khảo `.env.example`) và đặt `EXPO_PUBLIC_APP_ENV=development`. Đồng thời đặt `EXPO_PUBLIC_DEV_API_HOST` bằng IP LAN của máy chạy backend, ví dụ `192.168.1.X`. Mobile sẽ gọi `http://192.168.1.X:8080/api`; không dùng `localhost` trên thiết bị thật.

Khởi chạy Expo:
```bash
npx expo start
```
> Quét mã QR hiện trên Terminal bằng ứng dụng **Expo Go** (trên iOS/Android) để mở ứng dụng trên thiết bị thật.

---

## 📄 Tác giả & Bản quyền

Dự án được cấp phép theo [MIT License](LICENSE).

> **Cảm ơn bạn đã theo dõi và sử dụng Gnostica E-Learning Platform!** 🚀

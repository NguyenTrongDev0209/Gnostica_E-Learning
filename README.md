# Nền tảng Học trực tuyến Gnostica

Gnostica là một nền tảng học trực tuyến (E-Learning) chuyên nghiệp, full-stack được thiết kế cho học viên, giảng viên và quản trị viên. Dự án sở hữu giao diện người dùng hiện đại, responsive và kiến trúc backend mạnh mẽ, có khả năng mở rộng.

## 🚀 Tổng quan

Gnostica cung cấp một môi trường toàn diện để chia sẻ và tiếp nhận kiến thức. Giảng viên có thể tạo và quản lý các khóa học, trong khi học viên có thể tìm kiếm, đăng ký và học tập thông qua một trải nghiệm mượt mà. Nền tảng bao gồm cổng thanh toán bảo mật, diễn đàn tương tác và các công cụ quản trị nâng cao.

## 🛠️ Công nghệ sử dụng

### Backend (gnostica-server)
- **Framework**: Spring Boot 3.x (Java 17)
- **Database**: PostgreSQL (Persistence), Redis (Caching)
- **Security**: Spring Security với JWT & OAuth2 Client
- **Payment**: Tích hợp PayOS
- **Storage**: Cloudinary (Quản lý truyền thông)
- **Architecture**: Thiết kế hướng tên miền (Domain-driven design) với các lớp Controller, Service, Repository, và DTO.

### Frontend (gnostica-web)
- **Library**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 & Shadcn UI
- **State Management**: React Hook Form & Zod (Validation)
- **Networking**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

## ✨ Các tính năng chính

### 🎓 Dành cho Học viên
- **Khám phá khóa học**: Duyệt các khóa học theo danh mục với bộ lọc nâng cao.
- **Trải nghiệm học tập**: Trình phát bài học tương tác với tính năng theo dõi tiến độ.
- **Diễn đàn & Cộng đồng**: Tham gia thảo luận trong các diễn đàn của khóa học.
- **Thanh toán bảo mật**: Đăng ký khóa học dễ dàng thông qua cổng thanh toán PayOS.

### 👨‍🏫 Dành cho Giảng viên
- **Quản lý khóa học**: Dashboard toàn diện để tạo và cập nhật khóa học.
- **Theo dõi doanh thu**: Hệ thống ví chuyên dụng để theo dõi thu nhập.
- **Hệ thống Coupon**: Tạo và quản lý các mã giảm giá để thu hút học viên.
- **Quản lý hồ sơ**: Trang cá nhân giới thiệu giảng viên chuyên nghiệp.

### 👑 Dành cho Quản trị viên
- **Phân tích nền tảng**: Dashboard thời gian thực để theo dõi sự tăng trưởng và doanh thu.
- **Kiểm duyệt nội dung**: Công cụ quản lý người dùng, khóa học và các thiết lập toàn hệ thống.
- **Giám sát hạ tầng**: (Kế hoạch/Đã triển khai) WebSockets để theo dõi các chỉ số hệ thống trực tiếp.

## ⚙️ Bắt đầu

### Điều kiện tiên quyết
- JDK 17+
- Node.js 18+
- PostgreSQL
- Redis
- Maven

### Cài đặt

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd Gnostica_E-Learning
   ```

2. **Thiết lập Backend**:
   ```bash
   cd gnostica-server
   # Cấu hình application.properties với DB và API keys của bạn
   ./mvnw spring-boot:run
   ```

3. **Thiết lập Frontend**:
   ```bash
   cd gnostica-web
   npm install
   npm run dev
   ```

## 📄 Bản quyền
Dự án được cấp phép theo MIT License.

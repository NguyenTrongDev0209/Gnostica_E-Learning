# Frontend Web - Gnostica Web Application 🌐

> **Mục đích tài liệu:** Chi tiết kỹ thuật của phân hệ Web Frontend, bao gồm công nghệ, cấu trúc mã nguồn, danh sách trang, hệ thống routing, quản lý state, và các component quan trọng. Dùng để AI hoàn thiện tài liệu và báo cáo.

---

## 1. Thông tin Tổng quan

| Thuộc tính | Giá trị |
|-----------|---------|
| **Framework** | React 19.2 |
| **Build Tool** | Vite 7.3 |
| **Styling** | Tailwind CSS 4.2 |
| **UI Components** | Shadcn UI (Radix UI) |
| **Language** | JavaScript (JSX) |
| **Package Manager** | npm |
| **Port mặc định** | 5173 (dev), 80 (production Nginx) |
| **Module System** | ES Modules |

---

## 2. Công nghệ & Thư viện Chi tiết

### 2.1 Core & Build
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `react` | 19.2.0 | UI framework |
| `react-dom` | 19.2.0 | React DOM rendering |
| `vite` | 7.3.1 | Build tool, dev server, HMR |
| `@vitejs/plugin-react` | 5.1.1 | Vite React plugin |

### 2.2 Styling & UI
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `tailwindcss` | 4.2.1 | Utility-first CSS |
| `@tailwindcss/vite` | 4.2.1 | Tailwind Vite plugin |
| `tailwind-merge` | 3.5.0 | Merge Tailwind classes |
| `tw-animate-css` | 1.4.0 | Animation utilities |
| `radix-ui` | 1.4.3 | Headless UI components (Shadcn) |
| `shadcn` | 4.0.5 | Component generator |
| `class-variance-authority` | 0.7.1 | Component variants |
| `clsx` | 2.1.1 | Conditional class names |
| `framer-motion` | 12.38.0 | Animations & transitions |
| `lucide-react` | 0.577.0 | Icon library |
| `@fontsource-variable/geist` | 5.2.8 | Geist font |
| `@fontsource-variable/inter` | 5.2.8 | Inter font |
| `next-themes` | 0.4.6 | Dark/Light theme switching |

### 2.3 State Management & Data Fetching
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `zustand` | 5.0.14 | Global state (Auth store) |
| `@tanstack/react-query` | 5.101.0 | Server state management |
| `axios` | 1.13.6 | HTTP client |

### 2.4 Forms & Validation
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `react-hook-form` | 7.72.0 | Form management |
| `@hookform/resolvers` | 5.2.2 | Form resolver (Zod) |
| `zod` | 4.3.6 | Schema validation |

### 2.5 Routing
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `react-router-dom` | 7.13.1 | Client-side routing |

### 2.6 Real-time Communication
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `sockjs-client` | 1.6.1 | WebSocket fallback |
| `stompjs` | 2.3.3 | STOMP protocol (legacy, PayosQR) |
| `@stomp/stompjs` | 7.x | STOMP client (messaging + admin metrics) |

> **Messaging realtime**: `src/context/MessagingRealtimeProvider.jsx` + `src/lib/messaging/messagingRealtimeClient.js` (singleton, SockJS + `@stomp/stompjs`) — chỉ subscribe `/user/queue/messages`, `/user/queue/conversations`, `/user/queue/read-receipts`; gửi tin qua REST. Đồng bộ React Query cache bằng `src/lib/messaging/messagingCache.js`.

### 2.7 Rich Text & Media
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `react-quill-new` | 3.8.3 | Rich text editor (WYSIWYG) |
| `react-easy-crop` | 5.5.7 | Image cropping (avatar) |
| `embla-carousel-react` | 8.6.0 | Carousel/slider |
| `embla-carousel-autoplay` | 8.6.0 | Carousel autoplay |
| `react-resizable-panels` | 4.7.6 | Resizable panels (learning workspace) |

### 2.8 Data Visualization
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `recharts` | 3.8.1 | Charts (Admin/Instructor dashboard) |

### 2.9 Document & Certificate Generation
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `html2canvas` | 1.4.1 | HTML → Canvas screenshot |
| `html-to-image` | 1.11.13 | HTML → Image |
| `jspdf` | 4.2.1 | PDF generation (certificates) |

### 2.10 Utilities
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `fuse.js` | 7.2.0 | Fuzzy search (client-side) |
| `date-fns` | 4.1.0 | Date utility |
| `luxon` | 3.7.2 | Date/Time (timezone) |
| `dompurify` | 3.4.0 | XSS sanitization |
| `canvas-confetti` | 1.9.4 | Confetti animation (celebration) |
| `sonner` | 2.0.7 | Toast notifications |
| `cmdk` | 1.1.1 | Command palette |
| `vaul` | 1.1.2 | Drawer component |
| `input-otp` | 1.4.2 | OTP input component |
| `react-day-picker` | 9.14.0 | Date picker |
| `react-error-boundary` | 6.1.2 | Error boundary |
| `tus-js-client` | 4.2.3 | Resumable file upload (TUS protocol) |

---

## 3. Cấu trúc Mã nguồn Chi tiết

### 3.1 Entry Point

```
index.html              # HTML shell (Vite entry)
├── src/main.jsx         # React entry, QueryClientProvider, BrowserRouter
└── src/App.jsx          # Root component, route rendering, layout selection
```

### 3.2 Cấu hình (`src/config/`)

| File | Mô tả |
|------|-------|
| `environment.js` | **Quản lý URL tập trung** — Map `VITE_APP_ENV` → URLs cho API, WebSocket, OAuth2 |

**Quan trọng**: Đây là nơi DUY NHẤT khai báo URL. Không hardcode URL trong component/service.

```javascript
// Export: APP_ENV, WEB_ORIGIN, API_URL, WS_URL, OAUTH2_URL
```

### 3.3 Lớp Service (`src/services/`)

Mỗi service file tương ứng với một nhóm API endpoints:

| Thư mục | File | Endpoints |
|---------|------|-----------|
| `auth/` | `authService.js` | Login, Register, OTP, Google login, forgot/reset password |
| `course/` | `courseService.js` | Courses CRUD, search, filter |
| `course/` | `categoryService.js` | Categories |
| `course/` | `certificateService.js` | Certificate download |
| `course/` | `enrollmentService.js` | Enrollment management |
| `course/` | `giftService.js` | Gift courses |
| `course/` | `progressService.js` | Learning progress, lesson playback |
| `course/` | `questionService.js` | Question bank |
| `course/` | `reviewService.js` | Course reviews |
| `course/` | `wishlistService.js` | Wishlist/Favorites |
| `forum/` | `threadService.js` | Forum threads |
| `forum/` | `commentService.js` | Thread comments |
| `forum/` | `forumCategoryService.js` | Forum categories/topics |
| `forum/` | `threadReportService.js` | Report threads |
| `order/` | `orderService.js` | Orders |
| `order/` | `couponService.js` | Coupons |
| `order/` | `refund.service.js` | Refund requests |
| `payment/` | `walletService.js` | Wallet operations |
| `payment/` | `bankService.js` | Bank accounts |
| `payment/` | `transactionService.js` | Transaction history |
| `payment/` | `adminRefundService.js` | Admin refund management |
| `home/` | `homeService.js` | Homepage data |
| `instructor/` | `instructorService.js` | Instructor profile, courses |
| `instructor/` | `instructorDashboardService.js` | Instructor dashboard stats |
| `instructor/` | `followingService.js` | Follow/unfollow instructors |
| `admin/` | `dashboardService.js` | Admin dashboard stats |
| `admin/` | `adminCourseService.js` | Admin course moderation |
| `admin/` | `adminUserDetailService.js` | Admin user management |
| `admin/` | `aiService.js` | AI chat |
| `admin/` | `supportService.js` | Support ticket management |
| `settings/` | `settingsService.js` | System settings |
| `user/` | `accountService.js` | User profile, settings |
| `user/` | `notificationService.js` | Notifications |
| `messaging/` | `messagingService.js` | Conversations CRUD, messages (cursor), mark read |

### 3.4 Custom Hooks (`src/hooks/`)

Hooks được tổ chức theo feature domain, mirror cấu trúc services:

| Thư mục | Mô tả |
|---------|-------|
| `auth/` | useLogin, useRegister, useLogout, useOAuth2 |
| `course/` | useCourses, useCourseDetail, useEnrollments |
| `forum/` | useThreads, useComments |
| `order/` | useOrders, useCheckout |
| `payment/` | useWallet, useBanks |
| `dashboard/` | useDashboardStats |
| `instructor/` | useInstructorCourses, useInstructorDashboard |
| `admin/` | useAdminUsers, useAdminCourses |
| `home/` | useHomeData |
| `account/` | useProfile, useSettings |
| `settings/` | useSystemSettings |
| `user/` | useNotifications |
| `messaging/` | useConversations, useConversation, useMessages (infinite), useSendMessage (optimistic + clientMessageId), useMarkConversationRead, useCreateConversation |

Hooks đặc biệt:
- `useRecentSearchHistory.js` — Lưu lịch sử tìm kiếm gần đây (localStorage)
- `useTypewriterPlaceholder.js` — Hiệu ứng typewriter cho ô tìm kiếm

### 3.5 State Management (`src/store/`)

| File | Mô tả |
|------|-------|
| `useAuthStore.js` | Zustand store — quản lý `user`, `token`, `isAuthenticated`, `login()`, `logout()` |

**Lưu ý**: Chỉ Auth state dùng Zustand. Server state dùng React Query. Form state dùng React Hook Form.

### 3.6 Components (`src/components/`)

```
components/
├── ui/              # Shadcn UI primitives (Button, Dialog, Input, etc.)
│                    # Auto-generated bởi `npx shadcn add <component>`
├── common/          # Shared components
│   ├── Header, Footer, Sidebar
│   ├── Loading, EmptyState, ErrorFallback
│   ├── Pagination, SearchBar
│   └── ProtectedRoute, RoleGuard
├── fragments/       # Page sections/fragments
│   ├── home/        # Hero, FeaturedCourses, Categories
│   ├── course/      # CourseCard, ReviewList, QuizPlayer
│   ├── admin/       # AdminSidebar, StatsCards
│   └── instructor/  # InstructorSidebar, RevenueChart
├── layouts/         # Layout wrappers
│   ├── MainLayout   # Header + Footer (public pages)
│   ├── AccountLayout # Sidebar + Content (account pages)
│   ├── AdminLayout  # Admin sidebar + Content
│   ├── InstructorLayout # Instructor sidebar + Content
│   └── LearningLayout # Full-screen learning workspace
├── messaging/       # Messaging UI (MessagingShell, ConversationList, MessageThread, MessageBubble, MessageComposer...)
└── modals/          # Reusable modal dialogs
```

---

## 4. Hệ thống Routing Chi tiết

### 4.1 Public Routes (Không cần đăng nhập)

| Path | Component | Mô tả |
|------|-----------|-------|
| `/` | `HomePage` | Trang chủ |
| `/about` | `AboutUs` | Giới thiệu |
| `/courses` | `CourseCatalog` | Danh sách khóa học |
| `/courses/category` | `CourseCategory` | Khóa học theo danh mục |
| `/courses/category/:categorySlug` | `CourseCategory` | Danh mục cụ thể |
| `/courses/:slug` | `CourseDetail` | Chi tiết khóa học |
| `/search` | `SearchPage` | Tìm kiếm |
| `/forum` | `ForumPage` | Diễn đàn chính |
| `/forum/topic/:topicSlug` | `ForumTopicPage` | Topic diễn đàn |
| `/forum/:topicSlug/:slug` | `ForumDetail` | Chi tiết bài viết |
| `/profile/:id` | `UserProfile` | Hồ sơ người dùng |
| `/terms/*` | `TermsPage` | Điều khoản sử dụng |
| `/privacy` | `PrivacyPage` | Chính sách bảo mật |
| `/instructors` | `InstructorList` | Danh sách giảng viên |
| `/gift/:token` | `GiftResponsePage` | Nhận quà tặng khóa học |
| `/*` | `ContentPage` | Trang nội dung CMS (catch-all) |
| `/showcase` | `Showcase` | Trang showcase (no layout) |

### 4.2 Auth Routes (Chuyển hướng nếu đã đăng nhập)

| Path | Component | Mô tả |
|------|-----------|-------|
| `/login` | `LoginPage` | Đăng nhập |
| `/register` | `RegisterPage` | Đăng ký |
| `/forgot-password` | `ForgotPassword` | Quên mật khẩu |
| `/confirm-code` | `ConfirmPage` | Xác nhận OTP |
| `/reset-password` | `ResetPassword` | Đặt lại mật khẩu |
| `/auth/callback` | `OAuth2Callback` | Google OAuth2 callback |

### 4.3 Private Routes — Account (USER)

| Path | Component | Mô tả |
|------|-----------|-------|
| `/account` | `AccountOverview` | Tổng quan tài khoản |
| `/account/my-courses` | `MyCourses` | Khóa học của tôi |
| `/account/certificates` | `CertificatesPage` | Chứng chỉ |
| `/account/wishlist` | `WishlistPage` | Wishlist |
| `/account/orders` | `OrdersPage` | Lịch sử đơn hàng |
| `/account/refunds` | `RefundsPage` | Yêu cầu hoàn tiền |
| `/account/vouchers` | `VouchersPage` | Mã giảm giá |
| `/account/notifications` | `NotificationsPage` | Thông báo |
| `/account/settings` | `SettingsPage` | Cài đặt tài khoản |
| `/account/change-password` | `ChangePassword` | Đổi mật khẩu |
| `/account/following` | `FavoriteInstructors` | Giảng viên đang theo dõi |
| `/account/messages` | `AccountMessagingPage` | Hộp thư (chat với giảng viên) |
| `/account/messages/:conversationId` | `AccountMessagingPage` | Chi tiết hội thoại |

### 4.4 Private Routes — Learning

| Path | Component | Mô tả |
|------|-----------|-------|
| `/learning/:id` | `LearningWorkspace` | Không gian học tập (video + nội dung) |

### 4.5 Private Routes — Checkout

| Path | Component | Mô tả |
|------|-----------|-------|
| `/checkout` | `CheckoutPage` | Trang thanh toán |
| `/checkout/payos` | `PayosQR` | Thanh toán QR PayOS |
| `/checkout/:orderCode` | `CheckoutPage` | Kết quả thanh toán |

### 4.6 Private Routes — Forum (đăng nhập)

| Path | Component | Mô tả |
|------|-----------|-------|
| `/forum/create` | `ForumCreatePost` | Tạo bài viết |
| `/forum/me` | `MyForumPosts` | Bài viết của tôi |
| `/apply-instructor` | `ApplyInstructor` | Đăng ký làm giảng viên |

### 4.7 Private Routes — Admin (ADMIN role)

| Path | Component | Mô tả |
|------|-----------|-------|
| `/admin` | `AdminDashboard` | Dashboard tổng quan |
| `/admin/users` | `AdminUsers` | Quản lý người dùng |
| `/admin/courses` | `AdminCourses` | Quản lý khóa học |
| `/admin/categories` | `AdminCategories` | Quản lý danh mục |
| `/admin/orders` | `AdminOrders` | Quản lý đơn hàng |
| `/admin/coupons` | `AdminCoupons` | Quản lý mã giảm giá |
| `/admin/reviews` | `AdminReviews` | Quản lý đánh giá |
| `/admin/reports` | `AdminReports` | Quản lý báo cáo |
| `/admin/requests` | `AdminRequests` | Yêu cầu duyệt (instructor, payout) |
| `/admin/settings` | `AdminSettings` | Cài đặt hệ thống |
| `/admin/banks` | `AdminBanks` | Quản lý ngân hàng |
| `/admin/transactions` | `AdminTransactions` | Lịch sử giao dịch |
| `/admin/course-moderation` | `AdminCourseModeration` | Duyệt khóa học |
| `/admin/course-moderation/:slug` | `AdminCourseDetailModeration` | Chi tiết duyệt khóa học |
| `/admin/thread-moderation` | `AdminThreadModeration` | Duyệt bài forum |

### 4.8 Private Routes — Instructor (INSTRUCTOR role)

| Path | Component | Mô tả |
|------|-----------|-------|
| `/instructor` | `InstructorDashboard` | Dashboard thống kê |
| `/instructor/courses` | `InstructorCourses` | Quản lý khóa học |
| `/instructor/courses/courses-form` | `InstructorCourseForm` | Tạo khóa học mới |
| `/instructor/courses/edit/:slug` | `InstructorCourseForm` | Chỉnh sửa khóa học |
| `/instructor/revenue` | `InstructorRevenue` | Doanh thu & Ví |
| `/instructor/coupons` | `InstructorCoupons` | Quản lý mã giảm giá |
| `/instructor/students` | `InstructorStudents` | Quản lý học viên |
| `/instructor/qa` | `InstructorQA` | Hỏi đáp với học viên |
| `/instructor/messages` | `InstructorMessagingPage` | Hộp thư (chat với học viên) |
| `/instructor/messages/:conversationId` | `InstructorMessagingPage` | Chi tiết hội thoại |
| `/instructor/settings` | `InstructorSettings` | Cài đặt giảng viên |

---

## 5. Cấu hình Môi trường

### 5.1 File `.env`

```env
VITE_APP_ENV=development        # development | production
VITE_BUNNY_LIBRARY_ID=          # Bunny.net library ID (optional)
```

### 5.2 Mapping URL theo Môi trường

| Biến | `development` | `production` |
|------|-------------|-------------|
| `API_URL` | `http://localhost:8080/api` | `https://gnostica.io.vn/api` |
| `WS_URL` | `http://localhost:8080/ws` | `https://gnostica.io.vn/ws` |
| `OAUTH2_URL` | `http://localhost:8080/api/oauth2/authorization/google` | `https://gnostica.io.vn/api/oauth2/authorization/google` |

---

## 6. Build & Deploy

### Development
```bash
cd gnostica-web
npm install
cp .env.example .env
npm run dev     # → http://localhost:5173
```

### Production Docker
```dockerfile
# Stage 1: Build (Node 22)
FROM node:22-alpine AS build
# npm ci → npm run build (VITE_APP_ENV=production)

# Stage 2: Serve (Nginx 1.27)
FROM nginx:1.27-alpine
# Copy nginx.conf + dist/
EXPOSE 80
```

### Nginx Configuration
- SPA fallback: `try_files $uri $uri/ /index.html`
- Health check: `GET /health` → `200 ok`
- Security: Block `.env`, `.git`, `.sql`, `.pem` files

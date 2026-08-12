# ĐẶC TẢ KỸ THUẬT MVP NHẮN TIN TRỰC TIẾP (COURSE-BASED DIRECT MESSAGING)

**Dự án:** Gnostica E-Learning  
**Mục tiêu:** Xây dựng hệ thống nhắn tin trực tiếp MVP giữa Học viên (Student) và Giảng viên (Instructor) theo ngữ cảnh Khóa học (Course).  
**Ngày cập nhật:** 23/07/2026  
**Trạng thái:** Triển khai Phase 1.7 - Web Messaging User Interface (Web Routes, Shared MessagingPage, Shell/Components, Scroll Preservation, Mark-Read Triggers, Entry Points & Responsive Mobile Web)

---

## I. KHẢO SÁT HỆ THỐNG HIỆN TẠI (CURRENT SYSTEM ANALYSIS)

... (Tham chiếu các mục đã khảo sát ở Phase 1.2 – 1.6)

---

## II. THIẾT KẾ GIAO DIỆN & LUỒNG ĐIỀU HƯỚNG WEB (PHASE 1.7)

### 1. Cấu trúc Routes & Layouts
- **Shared Page Component:** [`MessagingPage.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/pages/messaging/MessagingPage.jsx) dùng chung logic giữa Học viên (`mode="account"`) và Giảng viên (`mode="instructor"`).
- **Học viên Routes (Student):**
  - `/account/messages`: Xem danh sách cuộc trò chuyện.
  - `/account/messages/:conversationId`: Xem cuộc trò chuyện cụ thể.
- **Giảng viên Routes (Instructor):**
  - `/instructor/messages`: Xem danh sách cuộc trò chuyện.
  - `/instructor/messages/:conversationId`: Xem cuộc trò chuyện cụ thể.

### 2. Cấu trúc Component Phía Frontend
- **Shell & Navigation:**
  - [`MessagingShell.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/MessagingShell.jsx): Bố cục khung chat (Layout 2 cột trên Desktop, Single Panel trên Mobile Web).
  - [`AccountSidebar.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/fragments/AccountSidebar.jsx) & [`InstructorSidebar.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/fragments/InstructorSidebar.jsx): Bổ sung mục menu "Tin nhắn" gắn icon `MessageSquare`.
- **Danh sách Cuộc trò chuyện (Conversation List):**
  - [`ConversationList.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/ConversationList.jsx): Lọc local theo tên người nhận hoặc khóa học, cảnh báo khi WebSocket reconnecting.
  - [`ConversationListItem.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/ConversationListItem.jsx): Hiển thị Avatar, Tên, Badge Vai trò (Học viên/Giảng viên), Tên khóa học, Preview tin nhắn cuối, Thời gian và Badge chưa đọc (`99+`).
  - [`ConversationListSkeleton.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/ConversationListSkeleton.jsx): Trạng thái loading skeleton.
- **Khung Chat & Tin nhắn (Message Thread):**
  - [`ConversationHeader.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/ConversationHeader.jsx): Nút Back trên mobile, thông tin người nhận & link tới khóa học.
  - [`MessageThread.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/MessageThread.jsx): Quản lý cuộn lịch sử tin nhắn, tự động cuộn xuống cuối khi nhận tin mới (nếu gần bottom), hiển thị nút nổi "Tin nhắn mới" nếu đang đọc lịch sử cũ, bảo tồn vị trí cuộn (`scrollTop += newScrollHeight - oldScrollHeight`) khi tải tin nhắn cũ.
  - [`MessageBubble.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/MessageBubble.jsx): Render an toàn plain text (`white-space: pre-wrap`, `overflow-wrap: anywhere`), hỗ trợ phân biệt người gửi theo `currentAccountId`.
  - [`MessageDeliveryStatus.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/MessageDeliveryStatus.jsx): Trạng thái tin nhắn gửi (`sending`, `sent`, `error` đi kèm nút **Thử lại / Retry** giữ nguyên `clientMessageId`).
  - [`MessageComposer.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/messaging/MessageComposer.jsx): Ô nhập tin nhắn tự điều chỉnh độ cao, Enter để gửi, Shift+Enter xuống dòng, chống gửi nhầm khi gõ tiếng Việt (IME composition guard `isComposing`), đếm ký tự (tối đa 5.000).

### 3. Điểm vào Ứng dụng (Entry Points)
- **Từ Trang Bài học (`LearningWorkspace.jsx`):** Bổ sung nút "Nhắn tin cho giảng viên" trên thanh công cụ tiêu đề. Gọi `createForStudent(courseId)` và điều hướng tới `/account/messages/{conversationId}`.
- **Từ Trang Quản lý Học viên (`InstructorStudents.jsx`):** Bổ sung nút "Nhắn tin" trong bảng danh sách học viên và modal xem khóa học học viên tham gia `StudentCoursesModal`. Gọi `createForInstructor({ courseId, studentId })` và điều hướng tới `/instructor/messages/{conversationId}`.

### 4. Tương thích Bố cục & Footer
- Trong [`MainLayout.jsx`](file:///c:/Users/PRECISION%205510/Documents/GitHub/Gnostica_E-Learning/gnostica-web/src/components/layouts/MainLayout.jsx), khi truy cập các tuyến đường nhắn tin `/account/messages/**`, giao diện tự động ẩn `MainFooter` và `AiChatBot` để tránh hiện tượng che khuất composer hoặc gây cuộn trang không mong muốn.

---

## III. KỊCH BẢN KIỂM THỬ THỦ CÔNG (MANUAL QA STEPS)

1. **Học viên mở cuộc trò chuyện từ bài học:**
   - Đăng nhập Học viên, mở trang bài học `/learning/{slug}`.
   - Nhấn "Nhắn tin cho giảng viên". Hệ thống gọi API `create-or-get` và chuyển hướng tới `/account/messages/{id}`.
2. **Gửi tin nhắn & Realtime:**
   - Học viên nhập tin nhắn và nhấn Enter. Tin nhắn hiển thị trạng thái `sending` rồi chuyển `sent`.
   - Đăng nhập Giảng viên ở cửa sổ khác, vào `/instructor/messages`. Giảng viên nhận ngay tin nhắn mới qua WebSocket và cuộc hội thoại tự chuyển lên đầu.
3. **Đánh dấu Đã đọc & Reconnect:**
   - Giảng viên mở cuộc hội thoại, di chuyển xuống cuối khung chat -> Gọi `markRead` và giảm unread badge.
   - Ngắt kết nối mạng tạm thời: Giao diện hiển thị cảnh báo nhẹ "Đang kết nối lại...", khi khôi phục mạng tự động đồng bộ lại cache.

---

## IV. CHECKLIST ACCEPTANCE CRITERIA PHASE 1.7

- [x] Tạo `MessagingPage.jsx`, `AccountMessagingPage.jsx`, `InstructorMessagingPage.jsx` và thêm các tuyến đường `/account/messages` & `/instructor/messages` vào `privateRoutes.js`.
- [x] Bổ sung mục menu "Tin nhắn" vào `AccountSidebar.jsx` và `InstructorSidebar.jsx`.
- [x] Triển khai `MessagingShell.jsx` hỗ trợ Layout 2 cột trên Desktop và Single Panel trên Mobile Web.
- [x] Triển khai `ConversationList.jsx` & `ConversationListItem.jsx` hiển thị avatar, tên, vai trò, tên khóa học, preview tin nhắn, thời gian & badge unread (`99+`).
- [x] Triển khai `MessageThread.jsx` bảo tồn vị trí cuộn khi load tin nhắn cũ, tự cuộn khi có tin mới và hiển thị nút "Tin nhắn mới" khi cuộn lên trên.
- [x] Triển khai `MessageBubble.jsx` & `MessageDeliveryStatus.jsx` hiển thị tin nhắn an toàn (plain text) và hỗ trợ nút Retry cho tin nhắn bị lỗi.
- [x] Triển khai `MessageComposer.jsx` tự co giãn height, Enter để gửi, Shift+Enter xuống dòng, hỗ trợ IME composition gõ tiếng Việt.
- [x] Tích hợp điểm vào từ `LearningWorkspace.jsx` ("Nhắn tin cho giảng viên").
- [x] Tích hợp điểm vào từ `InstructorStudents.jsx` ("Nhắn tin").
- [x] Ẩn `MainFooter` và `AiChatBot` trên tuyến đường nhắn tin để tránh đè giao diện.
- [x] Kiểm tra Linting thành công (`0 errors`).
- [x] Đóng gói sản phẩm thành công (`npm run build` thành công).

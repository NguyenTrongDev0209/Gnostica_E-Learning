import React from "react";
import { Link } from "react-router-dom";
import { Home, Shield } from "lucide-react";
import { AppBreadcrumb } from "@/components/common/AppSection";

const sections = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    items: [
      "Thông tin cá nhân: Họ tên, email, số điện thoại khi bạn đăng ký tài khoản.",
      "Thông tin thanh toán: Được xử lý qua cổng thanh toán bên thứ ba, chúng tôi không lưu trữ thông tin thẻ.",
      "Dữ liệu sử dụng: Lịch sử học tập, tiến trình khóa học, hoạt động trên nền tảng.",
      "Thông tin thiết bị: Loại trình duyệt, hệ điều hành, địa chỉ IP để cải thiện trải nghiệm.",
    ],
  },
  {
    title: "2. Mục đích sử dụng thông tin",
    items: [
      "Cung cấp và quản lý tài khoản người dùng của bạn.",
      "Xử lý thanh toán và gửi xác nhận đơn hàng.",
      "Cá nhân hóa trải nghiệm học tập và đề xuất khóa học phù hợp.",
      "Gửi thông báo về khóa học, cập nhật và khuyến mãi (có thể hủy đăng ký).",
      "Phân tích và cải thiện chất lượng dịch vụ.",
    ],
  },
  {
    title: "3. Bảo vệ dữ liệu",
    content:
      "Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn công nghiệp bao gồm mã hóa SSL 256-bit, xác thực hai yếu tố (2FA), và giám sát bảo mật 24/7. Dữ liệu cá nhân được lưu trữ trên máy chủ bảo mật và chỉ được truy cập bởi nhân viên có thẩm quyền.",
  },
  {
    title: "4. Chia sẻ thông tin với bên thứ ba",
    items: [
      "Chúng tôi không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn.",
      "Thông tin chỉ được chia sẻ với các đối tác cần thiết: cổng thanh toán, dịch vụ email.",
      "Có thể tiết lộ thông tin khi được yêu cầu bởi pháp luật hoặc cơ quan có thẩm quyền.",
      "Giảng viên chỉ nhận được thông tin tổng hợp, ẩn danh về học viên.",
    ],
  },
  {
    title: "5. Cookie và công nghệ theo dõi",
    content:
      "Chúng tôi sử dụng cookie để duy trì phiên đăng nhập, ghi nhớ tùy chọn người dùng và phân tích lưu lượng truy cập. Bạn có thể kiểm soát cài đặt cookie trong trình duyệt. Tuy nhiên, việc tắt cookie có thể ảnh hưởng đến một số chức năng của nền tảng.",
  },
  {
    title: "6. Quyền của bạn",
    items: [
      "Truy cập và xem thông tin cá nhân đã cung cấp.",
      "Chỉnh sửa hoặc cập nhật thông tin cá nhân bất kỳ lúc nào.",
      "Yêu cầu xóa tài khoản và dữ liệu liên quan.",
      "Từ chối nhận email quảng cáo và thông báo không cần thiết.",
      "Yêu cầu xuất dữ liệu cá nhân ở định dạng có thể đọc được.",
    ],
  },
  {
    title: "7. Lưu trữ dữ liệu",
    content:
      "Chúng tôi lưu trữ dữ liệu cá nhân trong thời gian tài khoản còn hoạt động hoặc theo yêu cầu pháp lý. Sau khi xóa tài khoản, dữ liệu sẽ được xóa hoàn toàn trong vòng 30 ngày, ngoại trừ dữ liệu cần thiết cho mục đích pháp lý hoặc kiểm toán.",
  },
  {
    title: "8. Liên hệ về quyền riêng tư",
    content:
      "Nếu bạn có câu hỏi hoặc lo ngại về chính sách bảo mật, vui lòng liên hệ Bộ phận bảo mật dữ liệu qua email: privacy@example.com hoặc hotline: 1900 xxxx.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb 
            items={[
              { label: "Trang chủ", href: "/", icon: Home },
              { label: "Chính sách bảo mật", isLast: true }
            ]} 
            linkClassName="text-slate-400 hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-slate-500"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Chính sách bảo mật
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Cập nhật lần cuối: 24 tháng 3, 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 mt-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-10 space-y-8">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
              )}
              {section.items && (
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 leading-relaxed">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

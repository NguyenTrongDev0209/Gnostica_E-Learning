import React from "react";
import { Link } from "react-router-dom";
import { Home, FileText } from "lucide-react";
import { AppBreadcrumb } from "@/components/common/AppSection";

const sections = [
  {
    title: "1. Giới thiệu",
    content:
      "Chào mừng bạn đến với nền tảng học trực tuyến của chúng tôi. Bằng việc truy cập và sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng.",
  },
  {
    title: "2. Tài khoản người dùng",
    items: [
      "Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản.",
      "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.",
      "Mỗi tài khoản chỉ được sử dụng bởi một cá nhân duy nhất.",
      "Chúng tôi có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản.",
    ],
  },
  {
    title: "3. Quyền sở hữu trí tuệ",
    content:
      "Tất cả nội dung khóa học, bao gồm video, tài liệu, bài tập và mã nguồn, đều thuộc quyền sở hữu của giảng viên và nền tảng. Nghiêm cấm sao chép, phân phối hoặc chia sẻ nội dung dưới bất kỳ hình thức nào mà không có sự đồng ý bằng văn bản.",
  },
  {
    title: "4. Thanh toán & Hoàn tiền",
    items: [
      "Tất cả giao dịch thanh toán được xử lý qua các cổng thanh toán bảo mật.",
      "Giá khóa học có thể thay đổi mà không cần thông báo trước.",
      "Yêu cầu hoàn tiền được chấp nhận trong vòng 30 ngày kể từ ngày mua.",
      "Khóa học miễn phí hoặc đã hoàn thành trên 50% sẽ không được hoàn tiền.",
    ],
  },
  {
    title: "5. Quy tắc ứng xử",
    items: [
      "Tôn trọng giảng viên và các học viên khác trong diễn đàn thảo luận.",
      "Không đăng tải nội dung spam, quảng cáo hoặc không phù hợp.",
      "Không sử dụng ngôn ngữ xúc phạm, phân biệt đối xử hoặc quấy rối.",
      "Báo cáo ngay các hành vi vi phạm cho đội ngũ hỗ trợ.",
    ],
  },
  {
    title: "6. Giới hạn trách nhiệm",
    content:
      "Chúng tôi nỗ lực cung cấp dịch vụ chất lượng cao nhất nhưng không đảm bảo rằng nền tảng sẽ hoạt động liên tục, không có lỗi. Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.",
  },
  {
    title: "7. Thay đổi điều khoản",
    content:
      "Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang web. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.",
  },
  {
    title: "8. Liên hệ",
    content:
      "Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ, vui lòng liên hệ chúng tôi qua email: support@example.com hoặc hotline: 1900 xxxx.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb 
            items={[
              { label: "Trang chủ", href: "/", icon: Home },
              { label: "Điều khoản dịch vụ", isLast: true }
            ]} 
            linkClassName="text-slate-400 hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-slate-500"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Điều khoản dịch vụ
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

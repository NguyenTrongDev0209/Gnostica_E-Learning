import { Monitor, Settings, Users, LineChart } from "lucide-react";

export const aboutToolsMock = [
  {
    icon: Monitor,
    title: "Cá nhân hóa AI",
    description: "Thuật toán tự động điều chỉnh nội dung theo tốc độ và phong cách học tập của bạn.",
  },
  {
    icon: Settings,
    title: "Kiểm tra Thích nghi",
    description: "Các bài đánh giá thử thách bạn vừa đủ để duy trì trạng thái tập trung cao độ.",
  },
  {
    icon: Users,
    title: "Không gian Hợp tác",
    description: "Kết nối với người học trên toàn thế giới trong các phòng học kỹ thuật số thời gian thực.",
  },
  {
    icon: LineChart,
    title: "Theo dõi Tiến độ",
    description: "Phân tích trực quan chi tiết về mức độ thông thạo các khái niệm phức tạp của bạn theo thời gian.",
  },
];

export const aboutStepsMock = [
  { title: "Liên hệ", description: "Liên hệ với chúng tôi để bắt đầu hành trình thay đổi bản thân." },
  { title: "Tư vấn", description: "Gặp gỡ cố vấn để thiết lập lộ trình học tập tùy chỉnh cho riêng bạn." },
  { title: "Đăng ký", description: "Tham gia cộng đồng và mở khóa nền tảng cá nhân hóa của bạn." },
  { title: "Học tập", description: "Tiếp cận nội dung đẳng cấp thế giới và bắt đầu phát triển." },
];

export const termsSectionsMock = [
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
      "Hoàn tiền tự động: Yêu cầu trong vòng 14 ngày kể từ ngày mua và tiến độ học tập dưới 20%.",
      "Hoàn tiền qua kiểm duyệt: Yêu cầu trong vòng 30 ngày sẽ được xem xét dựa trên lý do cụ thể.",
      "Số tiền hoàn lại sẽ được cộng vào Ví cá nhân trên hệ thống Gnostica.",
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

export const privacySectionsMock = [
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

export const aboutHeroMock = {
  badge: "TƯƠNG LAI CỦA GIÁO DỤC",
  title: "Chúng tôi tạo ra giải pháp cho việc",
  highlight: "Học tập.",
  description: "Tiếp sức cho những bộ óc tò mò thông qua những trải nghiệm học tập hiện đại, kết hợp trí tuệ nhân tạo với môi trường cộng tác lấy con người làm trung tâm.",
  primaryCta: "Bắt đầu ngay",
  primaryCtaUrl: "",
  secondaryCta: "Khám phá thêm",
  secondaryCtaUrl: ""
};

export const aboutVisionMock = {
  title: "Tầm nhìn của Chúng tôi về Tương lai",
  paragraphs: [
    "Chúng tôi tin rằng giáo dục nên độc đáo như chính những cá nhân tìm kiếm nó. Gnostica Academy cam kết tiên phong trong khung sư phạm dựa trên dữ liệu, nơi mọi lượt nhấp, tương tác và thành tích đều được phân tích để tinh chỉnh trải nghiệm học tập của bạn.",
    "Đến năm 2030, chúng tôi hình dung về một thế giới nơi giáo dục chất lượng cao không phải là đặc quyền, mà là một môi trường hiện đại, dễ dàng tiếp cận cho bất kỳ ai sẵn sàng khám phá. Sứ mệnh của chúng tôi là thu hẹp khoảng cách giữa nội dung tĩnh và sự hiểu biết động."
  ],
  quote: "Giáo dục là kiến trúc của tâm hồn.",
  author: "KHƠI DẬY ĐAM MÊ"
};

export const aboutCTAMock = {
  title: "Sẵn sàng bắt đầu chưa?",
  description: "Tham gia cùng hàng ngàn học viên đã thay đổi hành trình học tập của họ với nền tảng thông minh của chúng tôi.",
  buttonText: "Liên hệ với chúng tôi",
  buttonUrl: ""
};

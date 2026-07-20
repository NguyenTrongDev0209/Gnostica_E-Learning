INSERT INTO pages (title, slug, content, status, created_at, updated_at)
VALUES
(
    'Điều khoản dịch vụ',
    'terms',
    $$
    <h2>1. Giới thiệu</h2><p>Chào mừng bạn đến với nền tảng học trực tuyến của chúng tôi. Bằng việc truy cập và sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.</p>
    <h2>2. Tài khoản người dùng</h2><ul><li>Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản.</li><li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li><li>Mỗi tài khoản chỉ được sử dụng bởi một cá nhân duy nhất.</li><li>Chúng tôi có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản.</li></ul>
    <h2>3. Quyền sở hữu trí tuệ</h2><p>Tất cả nội dung khóa học, bao gồm video, tài liệu, bài tập và mã nguồn, đều thuộc quyền sở hữu của giảng viên và nền tảng. Nghiêm cấm sao chép hoặc phân phối khi chưa được cho phép.</p>
    <h2>4. Thanh toán và hoàn tiền</h2><ul><li>Giao dịch được xử lý qua các cổng thanh toán bảo mật.</li><li>Giá khóa học có thể thay đổi theo từng thời điểm.</li><li>Yêu cầu hoàn tiền được xem xét theo chính sách đang được công bố.</li></ul>
    <h2>5. Quy tắc ứng xử</h2><ul><li>Tôn trọng giảng viên và các học viên khác.</li><li>Không đăng nội dung spam, quảng cáo hoặc nội dung không phù hợp.</li><li>Không sử dụng ngôn ngữ xúc phạm, phân biệt đối xử hoặc quấy rối.</li></ul>
    <h2>6. Giới hạn trách nhiệm</h2><p>Chúng tôi nỗ lực cung cấp dịch vụ ổn định nhưng không bảo đảm nền tảng sẽ hoạt động liên tục và không có lỗi trong mọi trường hợp.</p>
    <h2>7. Thay đổi điều khoản</h2><p>Các điều khoản có thể được cập nhật. Thời điểm cập nhật gần nhất được hiển thị trên trang này.</p>
    $$,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Chính sách bảo mật',
    'privacy',
    $$
    <h2>1. Thông tin chúng tôi thu thập</h2><ul><li>Thông tin cá nhân được cung cấp khi đăng ký.</li><li>Thông tin giao dịch cần thiết để xử lý đơn hàng.</li><li>Dữ liệu sử dụng và tiến trình học tập.</li><li>Thông tin thiết bị phục vụ bảo mật và cải thiện trải nghiệm.</li></ul>
    <h2>2. Mục đích sử dụng</h2><ul><li>Cung cấp và quản lý tài khoản.</li><li>Xử lý thanh toán và xác nhận đơn hàng.</li><li>Cá nhân hóa trải nghiệm học tập.</li><li>Phân tích và cải thiện chất lượng dịch vụ.</li></ul>
    <h2>3. Bảo vệ dữ liệu</h2><p>Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân khỏi truy cập, thay đổi hoặc tiết lộ trái phép.</p>
    <h2>4. Chia sẻ với bên thứ ba</h2><p>Thông tin chỉ được chia sẻ với đơn vị cần thiết để vận hành dịch vụ hoặc khi pháp luật yêu cầu.</p>
    <h2>5. Cookie</h2><p>Cookie được sử dụng để duy trì phiên đăng nhập, ghi nhớ tùy chọn và phân tích hoạt động của nền tảng.</p>
    <h2>6. Quyền của bạn</h2><ul><li>Truy cập và cập nhật thông tin cá nhân.</li><li>Yêu cầu xóa tài khoản theo quy định.</li><li>Từ chối các thông báo tiếp thị không cần thiết.</li></ul>
    <h2>7. Lưu trữ dữ liệu</h2><p>Dữ liệu được lưu trong thời gian cần thiết để cung cấp dịch vụ và đáp ứng nghĩa vụ pháp lý.</p>
    $$,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO NOTHING;

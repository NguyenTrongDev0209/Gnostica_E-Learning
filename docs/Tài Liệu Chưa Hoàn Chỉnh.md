**CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI**

**1.1. Lý do chọn đề tài**

Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, hình thức học trực tuyến đang trở thành một phương thức học tập quan trọng, giúp người học tiếp cận kiến thức linh hoạt về không gian, thời gian và thiết bị. Tuy nhiên, nhiều nền tảng học trực tuyến hiện nay chỉ tập trung vào việc cung cấp video bài giảng, chưa giải quyết đầy đủ bài toán quản lý khóa học, theo dõi tiến độ, kiểm tra kiến thức, thanh toán, tương tác cộng đồng và quản lý doanh thu cho giảng viên.

Nhóm chúng em lựa chọn đề tài “Xây dựng website khóa học trực tuyến – Gnostica E-Learning” nhằm xây dựng một nền tảng E-Learning tích hợp, phục vụ đồng thời ba nhóm đối tượng: học viên, giảng viên và quản trị viên. Hệ thống không chỉ hỗ trợ đăng ký, mua và học khóa học mà còn cung cấp các chức năng quản lý nội dung học tập, bài kiểm tra, cấp chứng chỉ, diễn đàn thảo luận, ví điện tử cho giảng viên và kiểm duyệt nội dung.

Đề tài có tính thực tiễn cao vì giải quyết được quy trình khép kín của một nền tảng đào tạo trực tuyến:

1.  Giảng viên tạo nội dung, tải video và tổ chức khóa học theo chương/bài học.
2.  Quản trị viên kiểm duyệt, phê duyệt hoặc từ chối khóa học.
3.  Học viên tìm kiếm, mua khóa học, học theo lộ trình và theo dõi tiến độ.
4.  Hệ thống xử lý thanh toán qua PayOS và VNPAY.
5.  Học viên hoàn thành điều kiện được cấp chứng chỉ.
6.  Giảng viên theo dõi học viên, doanh thu và yêu cầu rút tiền.

Ngoài các chức năng cốt lõi, Gnostica còn tích hợp AI thông qua OpenRouter với mô hình Gemini 2.5 Flash Lite và phương án dự phòng DeepSeek. AI được sử dụng để hỗ trợ hội thoại, tạo câu hỏi nháp và quét/kiểm duyệt nội dung khóa học. Đây là yếu tố giúp hệ thống có điểm khác biệt so với các website khóa học cơ bản.

**1.2. Đối tượng và phạm vi của đề tài**

**1.2.1. Đối tượng nghiên cứu**

Đối tượng nghiên cứu của đề tài là mô hình hệ thống quản lý và cung cấp khóa học trực tuyến, bao gồm:

- Quy trình quản lý tài khoản và phân quyền người dùng.
- Quy trình tạo, cập nhật, kiểm duyệt và xuất bản khóa học.
- Quy trình học tập theo bài học, theo dõi tiến độ, làm bài kiểm tra và cấp chứng chỉ.
- Quy trình đặt hàng, thanh toán trực tuyến và ghi nhận giao dịch.
- Quy trình quản lý doanh thu, ví và rút tiền của giảng viên.
- Quy trình trao đổi cộng đồng qua diễn đàn, bình luận và thông báo.

**1.2.2. Phạm vi thực hiện**

Phạm vi của dự án gồm ba phân hệ chính:

| **Phân hệ** | **Công nghệ thực tế** | **Vai trò** |
| --- | --- | --- |
| Backend API | Java 17, Spring Boot, Spring Security, JPA, PostgreSQL | Xử lý nghiệp vụ, bảo mật, dữ liệu và tích hợp dịch vụ ngoài |
| Web application | React 19, Vite, Tailwind CSS, React Query, Zustand | Giao diện cho học viên, giảng viên và quản trị viên |
| Mobile application | React Native, Expo | Hỗ trợ học viên truy cập hệ thống trên thiết bị di động |

Trong phạm vi báo cáo này, nhóm chúng em tập trung chính vào website và backend API. Ứng dụng mobile là phân hệ mở rộng dùng chung API và logic dữ liệu.

**1.3. Mục tiêu của đề tài**

**1.3.1. Mục tiêu tổng quát**

Xây dựng nền tảng học trực tuyến Gnostica E-Learning có khả năng quản lý khóa học, hỗ trợ học viên học tập hiệu quả, hỗ trợ giảng viên kinh doanh nội dung số và giúp quản trị viên kiểm soát hoạt động toàn hệ thống.

**1.3.2. Mục tiêu cụ thể**

- Xây dựng cơ chế đăng ký, xác thực email OTP, đăng nhập JWT và đăng nhập OAuth2 Google.
- Phân quyền ba vai trò chính: ADMIN, INSTRUCTOR và USER.
- Cho phép giảng viên tạo khóa học, chương học (modules), bài học (lessons), bài kiểm tra và mã giảm giá.
- Cho phép quản trị viên kiểm duyệt khóa học thông qua các API như POST /api/admin/courses/{slug}/approve và POST /api/admin/courses/{slug}/reject.
- Hỗ trợ học viên tìm kiếm khóa học, thêm yêu thích, mua khóa học, học video, làm quiz và theo dõi tiến độ.
- Tích hợp PayOS và VNPAY, bao gồm webhook, IPN và luồng trả kết quả thanh toán.
- Quản lý chứng chỉ dựa trên điều kiện hoàn thành khóa học.
- Cung cấp diễn đàn, bình luận, bình chọn, thông báo và theo dõi giảng viên.
- Tích hợp AI hỗ trợ tạo câu hỏi và kiểm duyệt nội dung.
- Bảo đảm dữ liệu có thể mở rộng thông qua PostgreSQL, Redis, MongoDB và cơ chế migration Flyway.

**1.4. Ý nghĩa thực tiễn của đề tài**

Về mặt người học, Gnostica giúp tập trung toàn bộ quá trình học tập trong một nền tảng: tìm khóa học, thanh toán, học, làm bài kiểm tra, trao đổi với cộng đồng và nhận chứng chỉ.

Về mặt giảng viên, hệ thống hỗ trợ số hóa hoạt động giảng dạy và kinh doanh nội dung. Giảng viên có thể quản lý khóa học, danh sách học viên, doanh thu, mã khuyến mãi, tài khoản ngân hàng và yêu cầu rút tiền.

Về mặt quản trị, hệ thống cung cấp công cụ quản lý người dùng, danh mục, banner, trang chính sách, đơn hàng, giao dịch, kiểm duyệt khóa học, kiểm duyệt diễn đàn và thống kê tổng quan.

Về mặt kỹ thuật, dự án là cơ hội để nhóm chúng em vận dụng kiến thức về kiến trúc full-stack, REST API, xác thực JWT, phân quyền, xử lý thanh toán, cơ sở dữ liệu quan hệ, cache, lưu trữ media, AI và triển khai ứng dụng web hiện đại.

**CHƯƠNG 2. PHÂN TÍCH YÊU CẦU**

**2.1. Phân tích hiện trạng**

Các website học trực tuyến phổ biến thường đã cung cấp video bài giảng và thanh toán. Tuy nhiên, khi áp dụng vào mô hình vận hành thực tế, nền tảng cần giải quyết thêm các vấn đề: kiểm duyệt nội dung do giảng viên tạo, quản lý tiến độ học tập, quản lý chứng chỉ, xử lý thanh toán bất đồng bộ, bảo vệ tài nguyên khóa học và quản lý doanh thu.

Từ đó, nhóm chúng em xác định hệ thống cần được tổ chức theo ba vai trò:

- Học viên là người sử dụng nội dung học tập.
- Giảng viên là người tạo và quản lý nội dung khóa học.
- Quản trị viên là người điều hành, phê duyệt và kiểm soát nền tảng.

**2.2. Phân tích yêu cầu của khách hàng**

Khách hàng mong muốn một hệ thống có giao diện trực quan, dễ sử dụng, có khả năng mở rộng và quản lý được toàn bộ vòng đời của khóa học. Các yêu cầu trọng tâm gồm:

- Quản lý tài khoản, đăng ký, đăng nhập, xác thực và quên mật khẩu.
- Phân quyền học viên, giảng viên và quản trị viên.
- Tạo và quản lý khóa học theo danh mục.
- Tổ chức nội dung theo chương, bài học, video, tài liệu và quiz.
- Kiểm duyệt nội dung khóa học trước khi công khai.
- Thanh toán online và xác thực kết quả thanh toán qua callback/webhook.
- Theo dõi tiến độ học tập, kết quả quiz và chứng chỉ.
- Tạo cộng đồng trao đổi thông qua diễn đàn.
- Quản lý dữ liệu tài chính của giảng viên.
- Có báo cáo, thống kê và công cụ AI hỗ trợ.

**2.3. Yêu cầu chức năng hệ thống**

**2.3.1. Chức năng dành cho quản trị viên**

| **Mã** | **Chức năng** | **Mô tả** |
| --- | --- | --- |
| AD-01 | Quản lý tài khoản | Xem danh sách tài khoản, lọc theo vai trò, khóa và mở khóa tài khoản. |
| AD-02 | Kiểm duyệt khóa học | Xem khóa học chờ duyệt, xem chi tiết, phê duyệt hoặc từ chối kèm lý do. |
| AD-03 | Kiểm duyệt AI | Quét bài học, nội dung giới thiệu hoặc toàn bộ khóa học bằng AI. |
| AD-04 | Quản lý danh mục | Thêm, sửa, đổi trạng thái và xóa danh mục khóa học. |
| AD-05 | Quản lý banner và trang nội dung | Quản lý banner, trang giới thiệu, chính sách, điều khoản và cấu hình website. |
| AD-06 | Quản lý diễn đàn | Kiểm duyệt chủ đề, bình luận, bài viết vi phạm và báo cáo. |
| AD-07 | Quản lý đơn hàng/giao dịch | Theo dõi đơn hàng, thanh toán và trạng thái giao dịch. |
| AD-08 | Quản lý tài chính | Theo dõi ví, ngân hàng, yêu cầu rút tiền và tỷ lệ chia doanh thu. |
| AD-09 | Thống kê | Xem số liệu tổng quan, tăng trưởng thành viên, doanh thu, đơn hàng và khóa học nổi bật. |

**2.3.2. Chức năng dành cho giảng viên**

| **Mã** | **Chức năng** | **Mô tả** |
| --- | --- | --- |
| IN-01 | Đăng ký trở thành giảng viên | Gửi hồ sơ xác minh gồm CCCD, số điện thoại, CV và bằng cấp. |
| IN-02 | Quản lý khóa học | Tạo, chỉnh sửa, xóa và gửi khóa học để kiểm duyệt. |
| IN-03 | Quản lý cấu trúc nội dung | Tạo module/chương, bài học, video, tài liệu và sắp xếp thứ tự. |
| IN-04 | Quản lý quiz | Tạo ngân hàng câu hỏi, lưu nháp, cập nhật câu hỏi và dùng AI hỗ trợ sinh câu hỏi. |
| IN-05 | Quản lý học viên | Xem danh sách học viên đã đăng ký các khóa học của mình. |
| IN-06 | Quản lý mã giảm giá | Tạo coupon, xem danh sách, thay đổi trạng thái và xóa coupon. |
| IN-07 | Quản lý tài chính | Xem ví, giao dịch, liên kết ngân hàng và gửi yêu cầu rút tiền. |
| IN-08 | Xem dashboard | Theo dõi doanh thu, đánh giá, tăng trưởng học viên và hiệu quả khóa học. |

**2.3.3. Chức năng dành cho học viên**

| **Mã** | **Chức năng** | **Mô tả** |
| --- | --- | --- |
| ST-01 | Đăng ký/đăng nhập | Đăng ký bằng email, xác thực OTP, đăng nhập, quên và đặt lại mật khẩu. |
| ST-02 | Tìm kiếm khóa học | Xem danh mục, tìm kiếm, xem chi tiết, xem giảng viên và nhận gợi ý khóa học. |
| ST-03 | Đặt hàng/thanh toán | Tạo đơn hàng, áp dụng coupon, chọn cổng thanh toán và nhận kết quả thanh toán. |
| ST-04 | Học khóa học | Xem video, tài liệu, bài học và lưu tiến độ học tập. |
| ST-05 | Làm bài kiểm tra | Gửi đáp án, nhận kết quả và làm lại nếu thỏa điều kiện. |
| ST-06 | Chứng chỉ | Xem danh sách chứng chỉ đã đạt. |
| ST-07 | Tương tác cộng đồng | Tạo bài viết, bình luận, bình chọn, theo dõi giảng viên và lưu khóa học yêu thích. |
| ST-08 | Quản lý cá nhân | Cập nhật hồ sơ, ảnh đại diện, mật khẩu, thông báo, đơn hàng và khóa học đã mua. |

**2.4. Yêu cầu phi chức năng**

| **Nhóm yêu cầu** | **Nội dung** |
| --- | --- |
| Bảo mật | Mật khẩu được mã hóa bằng BCrypt; xác thực qua JWT; token truyền trong header Authorization: Bearer &lt;token&gt;; hỗ trợ OAuth2 Google. |
| Hiệu năng | Sử dụng Redis để hỗ trợ cache; phân trang dữ liệu; tạo index cho các trường tra cứu thường xuyên như trạng thái khóa học, tài khoản và đơn hàng. |
| Khả năng mở rộng | Backend tổ chức theo module; dữ liệu được migration bằng Flyway; PostgreSQL dùng cho dữ liệu quan hệ và MongoDB phục vụ dữ liệu phi cấu trúc/tích hợp AI. |
| Tính sẵn sàng | Luồng thanh toán dùng webhook/IPN để hệ thống vẫn có thể xác nhận giao dịch khi người dùng đóng trang thanh toán. |
| Tính đúng đắn dữ liệu | Database có khóa chính, khóa ngoại, unique constraint, check constraint và validation ở tầng DTO. |
| Khả năng sử dụng | Giao diện React responsive; có các khu vực riêng cho học viên, giảng viên và quản trị viên. |
| Lưu trữ tệp | Ảnh được hỗ trợ qua Cloudinary; video và tài liệu được cấu hình qua Bunny.net. Giới hạn upload tối đa hiện được cấu hình là 500 MB. |
| Tích hợp | Hỗ trợ PayOS, VNPAY, Google OAuth2, SMTP Gmail, OpenRouter/Gemini, DeepSeek, Redis Cloud và MongoDB Atlas. |

**CHƯƠNG 3. PHÂN TÍCH ĐỀ TÀI**

**3.1. Phân tích SWOT**

**3.1.1. Điểm mạnh (Strengths)**

- Kiến trúc full-stack rõ ràng, gồm backend, web và mobile dùng chung nghiệp vụ.
- Có đầy đủ chuỗi nghiệp vụ E-Learning: khóa học, bài học, quiz, tiến độ, chứng chỉ và diễn đàn.
- Hỗ trợ hai cổng thanh toán: PayOS và VNPAY.
- Có cơ chế kiểm duyệt khóa học và AI hỗ trợ kiểm tra nội dung.
- Tích hợp ví, tài khoản ngân hàng, payout và cơ chế chia doanh thu cho giảng viên.
- Sử dụng Flyway để kiểm soát phiên bản cơ sở dữ liệu.
- Dữ liệu khóa học có cơ chế versioning qua các trường như original_course_id, original_module_id, original_lesson_id và version_number.

**3.1.2. Điểm yếu (Weaknesses)**

- Hệ thống có nhiều tích hợp ngoài nên việc cấu hình môi trường tương đối phức tạp.
- Cần quản lý chặt chẽ khóa bí mật, tài khoản thanh toán và thông tin kết nối database; các giá trị này không được đưa vào mã nguồn công khai.
- Một số endpoint được cấu hình permitAll() ở tầng route và cần tiếp tục rà soát để bảo đảm phân quyền nghiệp vụ nhất quán bằng @PreAuthorize.
- Cơ chế thanh toán cần được kiểm thử kỹ với môi trường sandbox và dữ liệu callback thực tế.
- Hệ thống có nhiều bảng và nghiệp vụ liên kết, đòi hỏi tài liệu hóa tốt để đội phát triển dễ bảo trì.

**3.1.3. Cơ hội (Opportunities)**

- Nhu cầu học trực tuyến, học kỹ năng nghề và đào tạo nội bộ ngày càng tăng.
- AI có thể hỗ trợ gợi ý khóa học, sinh câu hỏi, kiểm duyệt nội dung và hỗ trợ học viên.
- Nền tảng có thể mở rộng thành marketplace nội dung số cho nhiều giảng viên.
- Ứng dụng mobile hiện hữu là nền tảng để mở rộng trải nghiệm đa thiết bị.

**3.1.4. Thách thức (Threats)**

- Cạnh tranh với các nền tảng E-Learning lớn.
- Rủi ro bảo mật đối với tài khoản, thanh toán và nội dung khóa học trả phí.
- Rủi ro gian lận thanh toán hoặc callback giả mạo nếu không xác thực chữ ký gateway đúng cách.
- Chi phí hạ tầng tăng theo số lượng video, tài liệu và người dùng.
- Yêu cầu kiểm duyệt nội dung ngày càng cao khi số lượng giảng viên và khóa học tăng.

**3.2. Phân tích yêu cầu của khách hàng**

Hệ thống được xây dựng theo mô hình phân quyền theo vai trò. Người dùng không chỉ khác nhau ở giao diện mà còn khác nhau ở phạm vi dữ liệu được truy cập.

- Học viên chỉ được học các khóa học mà mình đã đăng ký/mua.
- Giảng viên chỉ được quản lý khóa học và dữ liệu học viên thuộc khóa học của mình.
- Quản trị viên có quyền điều hành hệ thống, đặc biệt là phê duyệt khóa học và cấu hình nền tảng.

Các API thể hiện rõ nghiệp vụ chính, ví dụ:

| **Nghiệp vụ** | **API thực tế** |
| --- | --- |
| Đăng nhập | POST /api/auth/login |
| Đăng ký | POST /api/auth/register |
| Xác thực OTP | POST /api/auth/verify |
| Tạo khóa học | POST /api/courses |
| Cập nhật khóa học | PUT /api/courses/{slug} |
| Xem khóa học của giảng viên | GET /api/courses/instructor |
| Kiểm duyệt khóa học | GET /api/admin/courses/moderation |
| Phê duyệt khóa học | POST /api/admin/courses/{slug}/approve |
| Từ chối khóa học | POST /api/admin/courses/{slug}/reject |
| Tạo đơn thanh toán | POST /api/order/create |
| Nhận IPN VNPAY | GET /api/payment/vnpay/ipn |
| Cập nhật thời gian học | POST /api/progress/lesson/{lessonId}/time |
| Hoàn thành bài học | POST /api/progress/lesson/{lessonId}/complete |
| Nộp quiz | POST /api/progress/quiz/{quizId}/submit |

**3.3. Công nghệ và công cụ sử dụng**

**3.3.1. Công nghệ phát triển frontend**

Web frontend dùng React 19 và Vite. React phù hợp vì hỗ trợ phát triển giao diện theo component, tái sử dụng cao và phù hợp với hệ thống có nhiều khu vực nghiệp vụ như dashboard, khóa học, học tập, diễn đàn, thanh toán và quản trị.

Các công nghệ chính gồm:

- React 19: xây dựng giao diện component-based.
- Vite: khởi tạo môi trường phát triển và build frontend.
- React Router DOM: định tuyến giao diện.
- Axios: gọi REST API và gắn JWT bằng interceptor.
- Zustand: quản lý trạng thái đăng nhập toàn cục.
- TanStack React Query: quản lý server state, cache và đồng bộ dữ liệu API.
- React Hook Form và Zod: xử lý biểu mẫu và validation.
- Tailwind CSS, Radix UI và Shadcn: xây dựng giao diện responsive.
- Recharts: biểu diễn dữ liệu thống kê.
- SockJS và STOMP: phục vụ thông báo/giao tiếp thời gian thực.

**3.3.2. Công nghệ phát triển backend**

Backend dùng Java 17 và Spring Boot 4.0.5. Spring Boot phù hợp với đề tài vì hỗ trợ tốt REST API, validation, JPA, bảo mật, email, WebSocket và các cơ chế tích hợp ngoài.

Các thành phần chính:

- Spring Web: xây dựng RESTful API.
- Spring Data JPA: ánh xạ entity và thao tác PostgreSQL.
- Spring Security: quản lý xác thực, phân quyền và filter bảo mật.
- JJWT: phát sinh và xác minh JWT.
- BCrypt: mã hóa mật khẩu.
- Flyway: migration và quản lý phiên bản schema.
- PostgreSQL: cơ sở dữ liệu quan hệ chính.
- Redis: cache và hỗ trợ tối ưu hiệu năng.
- MongoDB: lưu dữ liệu phi cấu trúc/tích hợp AI.
- Cloudinary và Bunny.net: lưu trữ ảnh, video và tài liệu.
- PayOS, VNPAY: xử lý thanh toán.
- OpenRouter/Gemini và DeepSeek: AI hội thoại, tạo câu hỏi và kiểm duyệt.
- Apache POI/PDFBox: hỗ trợ xử lý tài liệu.

**CHƯƠNG 4. THIẾT KẾ HỆ THỐNG**

**4.1. Mô hình hệ thống**

Gnostica E-Learning được thiết kế theo kiến trúc client-server. Frontend web và ứng dụng mobile không truy cập trực tiếp cơ sở dữ liệu mà gửi yêu cầu đến backend Spring Boot thông qua REST API. Backend đảm nhiệm xác thực, phân quyền, xử lý nghiệp vụ và giao tiếp với các dịch vụ bên ngoài.

\`\`\`mermaid

flowchart LR

Web\["Web Application&lt;br/&gt;React 19 + Vite"\] --> API\["Spring Boot REST API"\]

Mobile\["Mobile Application&lt;br/&gt;React Native + Expo"\] --> API

API --> Security\["Spring Security&lt;br/&gt;JWT + OAuth2"\]

API --> Modules\["Business Modules&lt;br/&gt;Auth, Course, Order, Payment,&lt;br/&gt;Forum, Wallet, Dashboard"\]

Modules --> PG\["PostgreSQL&lt;br/&gt;Core relational data"\]

Modules --> Redis\["Redis Cloud&lt;br/&gt;Cache"\]

Modules --> Mongo\["MongoDB Atlas&lt;br/&gt;AI/unstructured data"\]

Modules --> Media\["Cloudinary&lt;br/&gt;Images"\]

Modules --> Bunny\["Bunny.net&lt;br/&gt;Video & documents"\]

Modules --> PayOS\["PayOS"\]

Modules --> VNPay\["VNPAY"\]

Modules --> AI\["OpenRouter / Gemini&lt;br/&gt;DeepSeek fallback"\]

Modules --> Mail\["Gmail SMTP"\]

\`\`\`

Luồng xử lý chung gồm các bước:

1.  Người dùng thao tác trên web hoặc mobile.
2.  Client gửi HTTP request tới API.
3.  JwtAuthenticationFilter kiểm tra header Authorization nếu request có token.
4.  Spring Security thiết lập SecurityContext với email và các role lấy từ JWT.
5.  Controller tiếp nhận request, kiểm tra validation bằng @Valid.
6.  Service xử lý nghiệp vụ.
7.  Repository/JPA thao tác PostgreSQL; khi cần sẽ gọi Redis, MongoDB hoặc dịch vụ ngoài.
8.  Backend trả JSON response để frontend cập nhật giao diện.

**4.2. Sơ đồ phân rã chức năng**

**4.2.1. Phân rã chức năng học viên**

\`\`\`mermaid

mindmap

root((Học viên))

Tài khoản

Đăng ký

Xác thực OTP

Đăng nhập

Quên mật khẩu

Cập nhật hồ sơ

Khóa học

Tìm kiếm

Xem chi tiết

Yêu thích

Đăng ký khóa học

Thanh toán

Tạo đơn hàng

Áp dụng coupon

PayOS/VNPAY

Xem đơn hàng

Học tập

Xem bài học

Lưu tiến độ

Làm quiz

Xem chứng chỉ

Cộng đồng

Tạo bài viết

Bình luận

Bình chọn

Theo dõi giảng viên

\`\`\`

**4.2.2. Phân rã chức năng giảng viên**

\`\`\`mermaid

mindmap

root((Giảng viên))

Hồ sơ giảng viên

Gửi đơn đăng ký

Cập nhật thông tin

Khóa học

Tạo khóa học

Cập nhật khóa học

Quản lý module

Quản lý bài học

Tải video/tài liệu

Gửi kiểm duyệt

Quiz

Quản lý ngân hàng câu hỏi

Tạo câu hỏi bằng AI

Cấu hình bài kiểm tra

Học viên

Xem danh sách học viên

Theo dõi tiến độ

Tài chính

Xem doanh thu

Quản lý coupon

Liên kết ngân hàng

Rút tiền

\`\`\`

**4.2.3. Phân rã chức năng quản trị viên**

\`\`\`mermaid

mindmap

root((Quản trị viên))

Tài khoản

Danh sách tài khoản

Khóa/Mở khóa

Duyệt giảng viên

Kiểm duyệt

Khóa học chờ duyệt

Phê duyệt

Từ chối

AI scan

Quản trị nội dung

Danh mục

Banner

Trang chính sách

Cấu hình hệ thống

Tài chính

Đơn hàng

Giao dịch

Payout

Doanh thu

Cộng đồng

Duyệt bài viết

Xử lý báo cáo

Quản lý diễn đàn

\`\`\`

**4.3. Sơ đồ Use Case**

**4.3.1. Use Case tổng quát**

\`\`\`mermaid

flowchart LR

Student\["Học viên"\]

Instructor\["Giảng viên"\]

Admin\["Quản trị viên"\]

Student --> A\["Đăng ký / Đăng nhập"\]

Student --> B\["Tìm kiếm và mua khóa học"\]

Student --> C\["Học, làm quiz, nhận chứng chỉ"\]

Student --> D\["Diễn đàn và đánh giá"\]

Instructor --> E\["Quản lý khóa học"\]

Instructor --> F\["Quản lý học viên và doanh thu"\]

Instructor --> G\["Tạo coupon / yêu cầu rút tiền"\]

Admin --> H\["Quản lý tài khoản"\]

Admin --> I\["Kiểm duyệt khóa học"\]

Admin --> J\["Quản trị danh mục, banner, cấu hình"\]

Admin --> K\["Theo dõi báo cáo và giao dịch"\]

\`\`\`

**4.3.2. Use Case chi tiết của quản trị viên**

Quản trị viên truy cập khu vực quản trị để quản lý tài khoản, kiểm duyệt khóa học, vận hành nội dung và theo dõi số liệu hệ thống. Các API tiêu biểu:

- GET /api/dashboard/stats: lấy số liệu tổng quan.
- GET /api/admin/courses/moderation: lấy danh sách khóa học cần kiểm duyệt.
- POST /api/admin/courses/{slug}/approve: phê duyệt và công khai khóa học.
- POST /api/admin/courses/{slug}/reject: từ chối khóa học và lưu lý do.
- POST /api/admin/courses/lessons/{lessonId}/ai-scan: quét một bài học bằng AI.
- POST /api/admin/courses/{slug}/ai-scan-full: quét toàn bộ nội dung khóa học.
- POST /api/auth/accounts/{id}/lock: khóa tài khoản.
- POST /api/auth/accounts/{id}/unlock: mở khóa tài khoản.
- POST/PUT/DELETE /api/admin/banners: quản lý banner.
- GET/PUT /api/admin/settings: đọc và cập nhật cấu hình hệ thống.

**4.3.3. Use Case chi tiết của giảng viên**

Giảng viên có thể tạo khóa học, xây dựng nội dung, quản lý học viên và theo dõi dữ liệu tài chính.

- POST /api/courses: tạo khóa học.
- PUT /api/courses/{slug}: cập nhật khóa học.
- GET /api/courses/instructor: lấy khóa học thuộc giảng viên đang đăng nhập.
- PATCH /api/courses/{id}/status: thay đổi trạng thái khóa học.
- POST /api/upload/image, /api/upload/document, /api/upload/video/init: tải media.
- GET /api/instructor/students: lấy danh sách học viên.
- GET /api/instructor-dashboard/stats: xem số liệu dashboard.
- POST /api/coupons: tạo coupon.
- POST /api/wallet/withdraw: gửi yêu cầu rút tiền.
- POST /api/instructor/courses/{courseId}/questions/ai-generate: dùng AI tạo câu hỏi nháp.

**4.3.4. Use Case chi tiết của học viên**

Học viên sử dụng hệ thống theo quy trình đăng ký, tìm khóa học, thanh toán, học tập và tương tác.

- POST /api/auth/register, POST /api/auth/verify, POST /api/auth/login.
- GET /api/courses, GET /api/courses/{slug} và GET /api/courses/recommendations.
- POST /api/favourites/toggle/{courseId}: thêm/bỏ yêu thích.
- POST /api/order/create: tạo yêu cầu thanh toán.
- GET /api/order/my-orders: xem lịch sử đơn hàng.
- GET /api/enrollments/my-courses: xem khóa học đã đăng ký.
- POST /api/progress/lesson/{lessonId}/time: lưu thời điểm học video.
- POST /api/progress/lesson/{lessonId}/complete: hoàn thành bài học.
- POST /api/progress/quiz/{quizId}/submit: nộp bài quiz.
- GET /api/certificates/my-certificates: xem chứng chỉ.
- POST /api/threads, POST /api/comments: tương tác diễn đàn.

**4.4. Sơ đồ ERD**

Cơ sở dữ liệu PostgreSQL được migration bằng Flyway. Migration khởi tạo định nghĩa 41 bảng, được tổ chức theo các nhóm nghiệp vụ: tài khoản, khóa học, học tập, thương mại điện tử, thanh toán, ví, diễn đàn và quản trị nội dung.

Tên bảng trong source khác một phần so với tài liệu mẫu:

| **Tên trong mẫu** | **Tên tương ứng trong source** | **Ý nghĩa** |
| --- | --- | --- |
| CourseRegistrations | enrollments | Đăng ký/mua khóa học của học viên |
| Discount | coupons, coupon_rules và trường courses.discount | Quản lý giảm giá theo mã hoặc theo khóa học |
| Chapter | modules | Chương/nội dung lớn của khóa học |
| ProgressVideo | lesson_progress | Tiến độ xem/học bài học |
| TransactionLog | payments, orders, payouts, logs | Dữ liệu giao dịch và nhật ký |

**4.4.1. Nhóm bảng tài khoản và phân quyền**

| **Bảng** | **Khóa chính và liên kết chính** | **Mô tả** |
| --- | --- | --- |
| roles | id  | Lưu vai trò ADMIN, INSTRUCTOR, USER. |
| accounts | id; role_id → roles.id | Lưu email, họ tên, mật khẩu, avatar, nhà cung cấp đăng nhập, trạng thái tài khoản. Email là duy nhất. |
| devices | account_id → accounts.id | Quản lý thiết bị/token thiết bị, IP và trạng thái tin cậy. |
| notifications | account_id → accounts.id | Lưu thông báo của từng người dùng. |
| logs | account_id → accounts.id | Lưu nhật ký hành động và payload JSONB. |
| follows | follower_id, followee_id → accounts.id | Lưu quan hệ theo dõi; cặp người theo dõi/người được theo dõi là duy nhất. |

**4.4.2. Nhóm bảng khóa học và nội dung**

| **Bảng** | **Khóa chính và liên kết chính** | **Mô tả** |
| --- | --- | --- |
| categories | account_id → accounts; parent_id → categories | Danh mục khóa học có cấu trúc phân cấp. |
| courses | account_id → accounts; category_id → categories; original_course_id → courses | Bảng trung tâm của hệ thống khóa học. Lưu tiêu đề, slug, mô tả, giá, giảm giá, cấp độ, video giới thiệu, trạng thái và version. |
| modules | course_id → courses; original_module_id → modules | Đại diện cho chương học; có thứ tự hiển thị và version. |
| lessons | module_id → modules; original_lesson_id → lessons | Lưu bài học, mô tả nội dung, URL video và thứ tự. |
| attachments | module_id → modules | Lưu tài liệu đính kèm của chương học. |
| questions | course_id → courses; original_question_id → questions | Ngân hàng câu hỏi của khóa học. |
| quizzes | module_id → modules; original_quiz_id → quizzes | Bài kiểm tra theo module; có max_attempts, passing_score. |
| quiz_questions | quiz_id → quizzes; question_id → questions | Bảng liên kết quiz và câu hỏi. |

**4.4.3. Nhóm bảng học tập, tiến độ và chứng chỉ**

| **Bảng** | **Khóa chính và liên kết chính** | **Mô tả** |
| --- | --- | --- |
| orders | account_id → accounts; coupon_id → coupons | Đơn hàng mua khóa học. |
| order_details | order_id → orders; course_id → courses | Chi tiết các khóa học thuộc đơn hàng. |
| enrollments | account_id → accounts; course_id → courses; order_detail_id → order_details | Xác lập quyền học sau khi thanh toán thành công; một học viên chỉ đăng ký một lần cho mỗi khóa học. |
| lesson_progress | account_id → accounts; lesson_id → lessons | Theo dõi bài học đã xem, thời điểm xem và trạng thái hoàn thành. |
| quiz_results | account_id → accounts; quiz_id → quizzes | Lưu điểm, số câu đúng, thời gian làm và chi tiết đáp án. |
| cert_requirements | course_id → courses | Điều kiện cấp chứng chỉ: tỷ lệ tiến độ tối thiểu và yêu cầu qua quiz. |

**4.4.4. Nhóm thương mại điện tử và thanh toán**

| **Bảng** | **Khóa chính và liên kết chính** | **Mô tả** |
| --- | --- | --- |
| coupons | account_id → accounts | Mã giảm giá do giảng viên/quản trị tạo; mã coupon là duy nhất. |
| coupon_rules | coupon_id → coupons | Quy tắc áp dụng coupon. |
| orders | account_id → accounts | Lưu tổng tiền, phương thức thanh toán, order code và trạng thái. |
| order_details | order_id → orders; course_id → courses | Lưu giá và giảm giá tại thời điểm mua. |
| payments | order_id → orders | Lưu mã giao dịch, số tiền, thông tin ngân hàng gửi và trạng thái thanh toán. |
| wallets | account_id → accounts | Ví của giảng viên, số dư không âm và thời điểm tiền khả dụng. |
| account_banks | account_id → accounts; bank_id → banks | Liên kết tài khoản ngân hàng rút tiền. |
| payouts | account_id → accounts; wallet_id → wallets; account_bank_id → account_banks | Yêu cầu/phiếu rút tiền. |
| commissions | account_id → accounts | Tỷ lệ chia doanh thu giữa giảng viên và nền tảng. |
| revenue_shares | Liên kết nghiệp vụ doanh thu | Phục vụ ghi nhận phân chia doanh thu. |

**4.4.5. Nhóm diễn đàn, tương tác và quản trị**

| **Nhóm** | **Các bảng** |
| --- | --- |
| Diễn đàn | topics, members, threads, comments, hashtags, thread_hashtags, votes |
| Tương tác khóa học | favorites, reviews, reports |
| Cấu hình website | banners, pages, system_configs |
| Tài chính và ngân hàng | banks, account_banks, wallets, payouts, commissions |

**4.4.6. ERD rút gọn các quan hệ cốt lõi**

\`\`\`mermaid

erDiagram

ROLES ||--o{ ACCOUNTS : assigns

ACCOUNTS ||--o{ COURSES : creates

CATEGORIES ||--o{ COURSES : categorizes

COURSES ||--o{ MODULES : contains

MODULES ||--o{ LESSONS : contains

MODULES ||--o{ QUIZZES : contains

COURSES ||--o{ QUESTIONS : owns

QUIZZES ||--o{ QUIZ_QUESTIONS : includes

QUESTIONS ||--o{ QUIZ_QUESTIONS : selected

ACCOUNTS ||--o{ ORDERS : places

COUPONS ||--o{ ORDERS : applied_to

ORDERS ||--o{ ORDER_DETAILS : contains

COURSES ||--o{ ORDER_DETAILS : purchased

ORDERS ||--o{ PAYMENTS : has

ACCOUNTS ||--o{ ENROLLMENTS : owns

COURSES ||--o{ ENROLLMENTS : grants_access

ACCOUNTS ||--o{ LESSON_PROGRESS : tracks

LESSONS ||--o{ LESSON_PROGRESS : progresses

ACCOUNTS ||--o{ QUIZ_RESULTS : submits

QUIZZES ||--o{ QUIZ_RESULTS : yields

COURSES ||--o| CERT_REQUIREMENTS : defines

ACCOUNTS ||--o{ THREADS : creates

TOPICS ||--o{ THREADS : groups

THREADS ||--o{ COMMENTS : has

ACCOUNTS ||--o{ COMMENTS : writes

\`\`\`

**4.5. Thiết kế giao diện**

Giao diện web được chia theo nhóm người dùng và nghiệp vụ. Source code tổ chức các trang trong thư mục gnostica-web/src/pages.

| **Khu vực giao diện** | **Trang tiêu biểu** | **Mục đích** |
| --- | --- | --- |
| Tổng quan | HomePage, AboutUs, InstructorList | Giới thiệu nền tảng, banner, danh mục và khóa học nổi bật. |
| Xác thực | LoginPage, RegisterPage, ForgotPassword, ResetPassword, ConfirmPage | Đăng ký, đăng nhập, OTP và khôi phục mật khẩu. |
| Khóa học | CourseCatalog, CourseCategory, CourseDetail, SearchPage | Tìm kiếm, lọc, xem thông tin và mua khóa học. |
| Học tập | LearningWorkspace, CertificatePage | Không gian học video, theo dõi tiến độ và xem chứng chỉ. |
| Học viên | MyCourses, OrdersPage, LearningProgress, WishlistPage, NotificationsPage | Quản lý tài khoản, khóa học và đơn hàng cá nhân. |
| Giảng viên | InstructorDashboard, InstructorCourses, InstructorCourseForm, InstructorStudents, InstructorRevenue | Quản lý nội dung, học viên, coupon và doanh thu. |
| Quản trị | AdminDashboard, AdminUsers, AdminCourses, AdminCourseModeration, AdminOrders, AdminTransactions | Điều hành và kiểm duyệt toàn hệ thống. |
| Diễn đàn | ForumPage, ForumDetail, ForumCreatePost, MyForumPosts | Trao đổi cộng đồng và quản lý bài viết. |
| Thanh toán | CheckoutPage, PayosQR, CheckoutResult | Tạo đơn, hiển thị QR/link thanh toán và nhận kết quả. |

Tôi đã hoàn thành phần Markdown chi tiết đến hết Chương 4, bám sát cấu trúc mẫu và hiệu chỉnh các công nghệ/tên bảng theo source thực tế. Bạn có muốn tôi tiếp tục viết Chương 5–8, gồm cấu trúc thư mục, JWT, 5 luồng hoạt động, test case, triển khai và tổng kết không?

10:20 AM

có ạ

10:27 AM

Worked for 1m 4s

**CHƯƠNG 5. THỰC HIỆN DỰ ÁN**

**5.1. Kế hoạch thực hiện dự án**

Nhóm chúng em triển khai dự án theo hướng phát triển từng phân hệ, ưu tiên hoàn thiện nghiệp vụ cốt lõi trước, sau đó tích hợp thanh toán, AI, thông báo và các chức năng quản trị.

| **Giai đoạn** | **Nội dung thực hiện** | **Kết quả** |
| --- | --- | --- |
| 1   | Khảo sát yêu cầu, phân tích vai trò người dùng | Xác định tác nhân: học viên, giảng viên, quản trị viên |
| 2   | Thiết kế database và migration Flyway | Schema PostgreSQL gồm 41 bảng nghiệp vụ |
| 3   | Xây dựng backend lõi | API xác thực, phân quyền, khóa học, danh mục |
| 4   | Xây dựng frontend web | Giao diện React cho public, học viên, giảng viên, admin |
| 5   | Phát triển học tập trực tuyến | Bài học, video, quiz, tiến độ, chứng chỉ |
| 6   | Tích hợp thương mại điện tử | Coupon, đơn hàng, PayOS, VNPAY |
| 7   | Hoàn thiện chức năng quản trị | Kiểm duyệt khóa học, dashboard, banner, cấu hình |
| 8   | Tích hợp AI và lưu trữ media | Gemini/OpenRouter, DeepSeek fallback, Cloudinary, Bunny.net |
| 9   | Kiểm thử, xử lý lỗi và tối ưu | Validation, test API, kiểm thử thanh toán, rà soát bảo mật |
| 10  | Build, triển khai và hoàn thiện báo cáo | Đóng gói WAR, build Vite và hướng dẫn vận hành |

**5.2. Cấu trúc dữ liệu và tổ chức mã nguồn**

**5.2.1. Cấu trúc Backend Spring Boot**

Backend nằm trong thư mục gnostica-server, tổ chức theo hướng module nghiệp vụ. Cách tổ chức này giúp tách biệt các nghiệp vụ như xác thực, khóa học, thanh toán, diễn đàn và ví điện tử; đồng thời giảm phụ thuộc giữa các phần của hệ thống.

gnostica-server/

├── src/main/java/com/gnostica/

│ ├── core/

│ │ ├── config/ # Security, CORS, payment, Redis...

│ │ ├── constant/ # Hằng số, enum trạng thái

│ │ ├── dto/ # Response dùng chung

│ │ ├── event/ # Event nghiệp vụ: thanh toán thành công...

│ │ ├── exception/ # Xử lý ngoại lệ

│ │ ├── listener/ # Lắng nghe event

│ │ ├── model/ # Entity JPA

│ │ ├── repository/ # JPA Repository

│ │ ├── security/ # JWT, OAuth2, filter bảo mật

│ │ └── util/ # Hàm tiện ích

│ ├── modules/

│ │ ├── auth/ # Đăng ký, đăng nhập, OTP, hồ sơ

│ │ ├── course/ # Course, module, lesson, quiz, tiến độ

│ │ ├── dashboard/ # Thống kê admin

│ │ ├── forum/ # Chủ đề, bài viết, bình luận, vote

│ │ ├── integration/ # AI, email, upload, Cloudinary, Bunny

│ │ ├── order/ # Order và coupon

│ │ ├── payment/ # PayOS, VNPAY, webhook, IPN

│ │ ├── settings/ # Banner, trang tĩnh, cấu hình

│ │ ├── user/ # Instructor, follow, favorite, notification

│ │ └── wallet/ # Ngân hàng, ví, payout

│ └── GnosticaServerApplication.java

├── src/main/resources/

│ ├── application.properties

│ ├── db/migration/ # Flyway migration V1...V12

│ └── templates/ # Email xác thực, reset password...

├── src/test/java/ # Test VNPAY và application context

├── pom.xml

├── mvnw

└── mvnw.cmd

Mỗi module thường gồm các tầng:

- controller: nhận HTTP request, định nghĩa API route.
- dto/request: nhận dữ liệu đầu vào và kiểm tra validation.
- dto/response: chuẩn hóa dữ liệu trả về frontend.
- service: xử lý nghiệp vụ.
- service/impl: cài đặt chi tiết nếu module sử dụng interface.
- repository: thao tác dữ liệu thông qua Spring Data JPA.

**5.2.2. Cấu trúc Frontend React**

Frontend web nằm trong thư mục gnostica-web. Dù yêu cầu ban đầu hướng tới Vue.js, source code thực tế được xây dựng bằng React 19 và Vite.

gnostica-web/

├── public/ # Logo, banner, ảnh tĩnh

├── src/

│ ├── assets/ # Tài nguyên giao diện

│ ├── components/

│ │ ├── common/ # Component dùng chung

│ │ ├── fragments/ # Header, footer, thành phần giao diện

│ │ ├── layouts/ # Bố cục public/admin/instructor

│ │ ├── modals/ # Hộp thoại

│ │ └── ui/ # Component UI cơ bản

│ ├── hooks/ # Custom hook theo nghiệp vụ

│ ├── lib/

│ │ ├── axiosClient.js # Axios instance và JWT interceptor

│ │ └── utils.js

│ ├── mocks/ # Dữ liệu mẫu giao diện

│ ├── pages/

│ │ ├── account/ # Hồ sơ, đơn hàng, khóa học của tôi

│ │ ├── admin/ # Dashboard và quản trị hệ thống

│ │ ├── auth/ # Login, register, OTP, reset password

│ │ ├── course/ # Catalog, chi tiết, tìm kiếm khóa học

│ │ ├── forum/ # Diễn đàn

│ │ ├── general/ # Home, about, terms, privacy

│ │ ├── instructor/ # Dashboard và form khóa học giảng viên

│ │ ├── learning/ # Không gian học và chứng chỉ

│ │ └── order/ # Checkout, QR, kết quả thanh toán

│ ├── routers/ # Public/private route

│ ├── services/ # Lớp gọi API theo module

│ ├── store/

│ │ └── useAuthStore.js # Zustand auth state

│ ├── utils/ # Validation, recommendation, crop image...

│ ├── main.jsx

│ └── index.css

├── package.json

├── vite.config.js

└── .env.example

Frontend sử dụng Axios để gọi API. Trong axiosClient.js, interceptor đọc thông tin người dùng từ localStorage, lấy trường token và tự động gắn vào request header:

Authorization: Bearer &lt;JWT_TOKEN&gt;

Khi backend trả về HTTP 401 Unauthorized, frontend gọi useAuthStore.getState().logout() để xóa trạng thái người dùng và chuyển về trang đăng nhập.

**5.2.3. Cấu trúc ứng dụng mobile**

Dự án còn có phân hệ gnostica-mobile, xây dựng trên React Native và Expo. Phân hệ này dùng chung API backend, tập trung vào trải nghiệm học tập và mua khóa học trên điện thoại.

gnostica-mobile/

├── src/

│ ├── assets/

│ ├── components/

│ ├── config/

│ ├── context/

│ ├── navigation/

│ ├── screens/

│ │ ├── auth/

│ │ ├── checkout/

│ │ ├── course/

│ │ ├── forum/

│ │ ├── home/

│ │ ├── instructor/

│ │ └── profile/

│ ├── services/

│ └── styles/

├── App.jsx

├── app.json

└── package.json

**5.3. Thiết kế chức năng và luồng hoạt động**

**5.3.1. Luồng đăng ký, xác thực OTP và đăng nhập JWT**

Quy trình đăng ký được xử lý bởi AuthController qua API POST /api/auth/register. DTO RegisterRequest kiểm tra họ tên không được rỗng, email đúng định dạng và mật khẩu có tối thiểu 8 ký tự.

Trong AuthServiceImpl.register():

1.  Hệ thống kiểm tra email đã tồn tại hay chưa.
2.  Gán role mặc định là USER.
3.  Mật khẩu được mã hóa bằng BCryptPasswordEncoder.
4.  Tài khoản được lưu với trạng thái STATUS_UNVERIFIED.
5.  OTP được sinh và lưu qua OtpService trong 3 phút.
6.  Email xác thực được gửi bằng MailService.

\`\`\`mermaid

flowchart TD

A\["Người dùng nhập họ tên, email, mật khẩu"\] --> B\["POST /api/auth/register"\]

B --> C{"Email đã tồn tại?"}

C -- Có --> D\["Trả lỗi 400"\]

C -- Không --> E\["BCrypt mã hóa mật khẩu"\]

E --> F\["Tạo Account role USER, status UNVERIFIED"\]

F --> G\["OtpService.generateAndStore: TTL 3 phút"\]

G --> H\["MailService.sendVerificationEmail"\]

H --> I\["POST /api/auth/verify?email&code"\]

I --> J{"OTP hợp lệ?"}

J -- Không --> K\["Trả lỗi 400"\]

J -- Có --> L\["Cập nhật Account status ACTIVE"\]

L --> M\["Người dùng đăng nhập"\]

M --> N\["POST /api/auth/login"\]

N --> O\["AuthenticationManager xác thực"\]

O --> P\["JwtProvider.generateToken"\]

P --> Q\["Trả LoginResponse: token, email, role, avatar"\]

\`\`\`

Ở luồng đăng nhập, AuthServiceImpl.login() kiểm tra tài khoản tồn tại, không phải tài khoản Google, không bị khóa; sau đó gọi AuthenticationManager.authenticate(). Nếu thành công, JwtProvider.generateToken() tạo token chứa:

- subject: email người dùng.
- roles: danh sách quyền của người dùng.
- issuedAt: thời điểm phát hành.
- expiration: thời điểm hết hạn; cấu hình hiện tại là 86.400.000 ms, tương đương 24 giờ.

**5.3.2. Cơ chế bảo mật JWT**

SecurityConfig triển khai cơ chế bảo mật stateless:

- Tắt CSRF cho REST API.
- Cấu hình CORS cho frontend local.
- Cấu hình SessionCreationPolicy.STATELESS.
- Chèn JwtAuthenticationFilter trước UsernamePasswordAuthenticationFilter.
- Dùng BCryptPasswordEncoder để lưu mật khẩu dưới dạng hash.
- Kích hoạt method security để sử dụng @PreAuthorize.

Luồng JwtAuthenticationFilter:

1.  Đọc header Authorization.
2.  Kiểm tra header có dạng Bearer &lt;token&gt;.
3.  Gọi JwtProvider.validateToken() để xác minh chữ ký và hạn token.
4.  Lấy email qua getUsernameFromJWT().
5.  Lấy danh sách role qua getRolesFromJWT().
6.  Tạo UsernamePasswordAuthenticationToken.
7.  Đưa authentication vào SecurityContextHolder.
8.  Controller/service có thể lấy email hiện tại từ Authentication.

Ví dụ, AdminCourseController dùng:

@PreAuthorize("hasRole('ADMIN')")

@RequestMapping("/api/admin/courses")

Do đó, các API kiểm duyệt khóa học được bảo vệ ở cấp controller. Nhóm chúng em xác định đây là cách phân quyền rõ ràng cần tiếp tục áp dụng nhất quán cho tất cả endpoint quản trị trong giai đoạn mở rộng hệ thống.

**5.3.3. Luồng quản lý khóa học**

Khóa học được tạo qua POST /api/courses và cập nhật qua PUT /api/courses/{slug}. Dữ liệu nhận vào là CourseRequest, gồm thông tin cơ bản, danh mục, danh sách sections/module, lesson, question bank và quiz.

Các ràng buộc quan trọng:

- title, slug, description, thumbnail bắt buộc.
- price không được âm.
- discount trong khoảng từ 0 đến 100.
- categoryId bắt buộc.
- sections phải có ít nhất một chương.
- Mỗi lesson bắt buộc có title, content và videoUrl.

\`\`\`mermaid

flowchart TD

A\["Giảng viên nhập CourseRequest"\] --> B\["POST /api/courses"\]

B --> C\["CourseService.createCourse"\]

C --> D\["Kiểm tra Account và Category"\]

D --> E{"Danh mục đang hiển thị?"}

E -- Không --> F\["Trả lỗi"\]

E -- Có --> G\["Tạo Course status = 4: chờ duyệt"\]

G --> H\["Tạo Module, Lesson, Attachment"\]

H --> I\["Lưu Question Bank"\]

I --> J\["Ánh xạ question ID cho Quiz"\]

J --> K\["QuizService.saveQuizForModule"\]

K --> L\["Lưu Course xuống PostgreSQL"\]

L --> M\["Xóa bản nháp Redis"\]

M --> N\["Admin kiểm duyệt"\]

\`\`\`

Điểm đáng chú ý là hệ thống có cơ chế versioning. Khi giảng viên cập nhật một khóa học đã xuất bản (status = 1), CourseService.updateCourseBySlug() không ghi đè trực tiếp lên bản đang công khai. Hệ thống tạo bản nháp mới với:

- original_course_id trỏ về khóa học gốc.
- version_number tăng lên.
- slug mới theo định dạng phiên bản.
- module và lesson có thể lưu liên kết original_module_id, original_lesson_id.

Cơ chế này giúp học viên đang học vẫn truy cập nội dung đã công khai trong khi giảng viên tiếp tục chỉnh sửa phiên bản mới.

**5.3.4. Luồng quản lý học viên của giảng viên**

Giảng viên xem danh sách học viên qua API GET /api/instructor/students. Controller lấy email từ Authentication, sau đó gọi:

enrollmentService.getInstructorStudents(email)

Học viên được xác định từ bảng enrollments, liên kết tới khóa học do giảng viên tạo. Khi giảng viên xem chi tiết một học viên, frontend gọi:

GET /api/instructor/students/{studentId}/courses

Backend gọi:

enrollmentService.getStudentEnrollmentsForInstructor(studentId, instructorEmail)

Nhờ truyền instructorEmail, hệ thống giới hạn dữ liệu trả về trong phạm vi khóa học của giảng viên đang đăng nhập.

\`\`\`mermaid

flowchart TD

A\["Giảng viên đăng nhập"\] --> B\["JWT xác thực"\]

B --> C\["GET /api/instructor/students"\]

C --> D\["Lấy email từ Authentication"\]

D --> E\["EnrollmentService.getInstructorStudents(email)"\]

E --> F\["Truy vấn Enrollment + Course + Account"\]

F --> G\["Trả InstructorStudentDTO"\]

G --> H\["Hiển thị danh sách học viên"\]

H --> I\["GET /api/instructor/students/{studentId}/courses"\]

I --> J\["Kiểm tra phạm vi khóa học của giảng viên"\]

J --> K\["Trả danh sách EnrollmentDTO hợp lệ"\]

\`\`\`

**5.3.5. Luồng thanh toán VNPAY**

Hệ thống áp dụng Strategy Pattern cho thanh toán. PaymentStrategyFactory trả về chiến lược xử lý tương ứng với phương thức thanh toán: PayOS hoặc VNPAY.

Quy trình tạo đơn:

1.  Frontend gọi POST /api/order/create.
2.  OrderService.createPaymentLink() lấy email hiện tại từ JWT.
3.  Hệ thống lấy giá thực tế từ database bằng course.getSalePrice(), không tin giá do frontend gửi lên.
4.  Nếu có coupon, hệ thống gọi couponService.validateCoupon(), tính giá giảm và giảm số lượng coupon.
5.  Hệ thống tạo Order trạng thái PENDING và OrderDetail.
6.  Nếu giá bằng 0, đơn được đánh dấu PAID với phương thức FREE/COUPON.
7.  Nếu không, PaymentService.createPaymentLink() gọi VNPayPaymentStrategy.createPaymentLink() hoặc PayOSPaymentStrategy.createPaymentLink().

\`\`\`mermaid

flowchart TD

A\["Học viên chọn VNPAY"\] --> B\["POST /api/order/create"\]

B --> C\["OrderService.createPaymentLink"\]

C --> D\["Lấy Course và giá thực tế từ DB"\]

D --> E\["Kiểm tra Coupon nếu có"\]

E --> F\["Tạo Order PENDING + OrderDetail"\]

F --> G\["VNPayPaymentStrategy.createPaymentLink"\]

G --> H\["Chuyển hướng đến trang thanh toán VNPAY"\]

H --> I\["VNPAY gọi GET /api/payment/vnpay/ipn"\]

I --> J\["verifyWebhook: xác thực chữ ký"\]

J --> K{"Đúng order, đúng gateway, đúng số tiền?"}

K -- Không --> L\["Trả mã lỗi IPN"\]

K -- Có --> M\["handleVNPayIpn"\]

M --> N\["processSuccessfulOrder: Order = PAID"\]

N --> O\["saveTransaction: tránh giao dịch trùng"\]

O --> P\["PaymentSuccessEvent"\]

P --> Q\["Tạo Enrollment/quyền học theo listener"\]

\`\`\`

PaymentServiceImpl.handleVNPayIpn() thực hiện các kiểm tra quan trọng:

- Xác thực signature callback.
- Kiểm tra order tồn tại.
- Kiểm tra order sử dụng đúng gateway VNPAY.
- Kiểm tra đơn hàng chưa được xử lý.
- Kiểm tra số tiền callback bằng tổng tiền của đơn hàng.
- Kiểm tra trạng thái thanh toán là PAID.
- Kiểm tra transaction code không rỗng.
- Tránh tạo giao dịch trùng qua existsByGatewayAndGatewayTransactionNo().

Ngoài IPN, source còn có VNPayReconciliationScheduler để đối soát các thanh toán chờ trong trường hợp IPN không đến được hệ thống.

**5.3.6. Luồng cập nhật bài học**

Trong source hiện tại, lesson không có controller cập nhật riêng. Bài học được cập nhật lồng trong payload của khóa học thông qua:

PUT /api/courses/{slug}

và được xử lý tại:

CourseService.updateCourseBySlug(String slug, CourseRequest request, String email)

\`\`\`mermaid

flowchart TD

A\["Giảng viên chỉnh sửa lesson trong form khóa học"\] --> B\["PUT /api/courses/{slug}"\]

B --> C\["Xác minh người sở hữu khóa học"\]

C --> D{"Khóa học đã xuất bản?"}

D -- Có --> E\["Tạo/Cập nhật bản nháp version mới"\]

D -- Không --> F\["Cập nhật trực tiếp bản nháp"\]

E --> G\["Duyệt ModuleRequest và LessonRequest"\]

F --> G

G --> H\["Cập nhật title, content, videoUrl, metadata, sortOrder"\]

H --> I\["Lesson không còn trong request → đánh dấu deleted"\]

I --> J\["Kiểm tra mỗi module còn ít nhất một lesson"\]

J --> K\["Lưu Course, Module, Lesson, Quiz"\]

K --> L\["So sánh video cũ và mới"\]

L --> M\["Xóa video mồ côi trên Bunny.net nếu không còn được dùng"\]

M --> N\["Xóa Redis draft"\]

N --> O\["Trả CourseDetailResponse"\]

\`\`\`

Logic cập nhật lesson thể hiện một số xử lý quan trọng:

- Xóa mềm lesson không còn trong request thay vì xóa cứng.
- Giữ thứ tự bài học bằng sortOrder.
- Tự tạo version mới nếu chỉnh sửa khóa học đã công khai.
- Kiểm tra mỗi module còn ít nhất một lesson hoạt động.
- So sánh URL video cũ và mới để dọn video không còn được sử dụng trên Bunny.net.
- Xóa bản nháp Redis sau khi lưu thành công.

**CHƯƠNG 6. KIỂM THỬ**

**6.1. Kế hoạch kiểm thử**

Nhóm chúng em thực hiện kiểm thử theo ba mức:

- Kiểm thử validation dữ liệu đầu vào tại backend.
- Kiểm thử API theo từng nghiệp vụ.
- Kiểm thử giao diện và luồng người dùng từ đầu đến cuối.

Các test case dưới đây được xây dựng từ validation thực tế trong các DTO như RegisterRequest, CourseRequest, LessonRequest, CategoryRequest, CouponRequest, InstructorApplicationRequest, PageRequest và BannerRequest.

**6.2. Các trường hợp kiểm thử**

**6.2.1. Kiểm thử đăng ký và đăng nhập**

| **Mã TC** | **Chức năng** | **Dữ liệu/Thao tác** | **Kết quả mong đợi** |
| --- | --- | --- | --- |
| TC-AUTH-01 | Đăng ký | Bỏ trống họ tên | Trả lỗi “Họ tên không được để trống”. |
| TC-AUTH-02 | Đăng ký | Email sai định dạng | Trả lỗi “Email không hợp lệ”. |
| TC-AUTH-03 | Đăng ký | Mật khẩu dưới 8 ký tự | Trả lỗi mật khẩu phải từ 8 ký tự trở lên. |
| TC-AUTH-04 | Đăng ký | Email đã tồn tại | AuthServiceImpl.register() từ chối tạo tài khoản. |
| TC-AUTH-05 | Xác thực OTP | OTP đúng trong 3 phút | Tài khoản chuyển từ UNVERIFIED sang ACTIVE. |
| TC-AUTH-06 | Xác thực OTP | OTP sai hoặc hết hạn | Trả lỗi xác thực. |
| TC-AUTH-07 | Đăng nhập | Email/mật khẩu đúng | Trả LoginResponse có JWT, email, role, avatar. |
| TC-AUTH-08 | Đăng nhập | Tài khoản trạng thái BANNED | Từ chối đăng nhập. |
| TC-AUTH-09 | Đăng nhập | Tài khoản Google đăng nhập bằng password | Trả thông báo yêu cầu dùng Google OAuth2. |
| TC-AUTH-10 | Reset password | Email sai định dạng hoặc OTP trống | Backend trả lỗi validation. |

**6.2.2. Kiểm thử quản lý khóa học**

| **Mã TC** | **Dữ liệu/Thao tác** | **Kết quả mong đợi** |
| --- | --- | --- |
| TC-COURSE-01 | Bỏ trống tên khóa học | Bị chặn bởi @NotBlank. |
| TC-COURSE-02 | Bỏ trống slug | Bị chặn bởi @NotBlank. |
| TC-COURSE-03 | Bỏ trống mô tả hoặc thumbnail | Bị từ chối. |
| TC-COURSE-04 | Giá nhỏ hơn 0 | Bị từ chối bởi @Min(0). |
| TC-COURSE-05 | Discount nhỏ hơn 0 hoặc lớn hơn 100 | Bị từ chối bởi @Min(0) và @Max(100). |
| TC-COURSE-06 | Không chọn category | Bị từ chối bởi @NotNull. |
| TC-COURSE-07 | Không có module/chương | Bị từ chối bởi @NotEmpty. |
| TC-COURSE-08 | Một module không có lesson còn hoạt động | updateCourseBySlug() trả lỗi nghiệp vụ. |
| TC-COURSE-09 | Giảng viên cập nhật khóa học của người khác | Trả lỗi không có quyền chỉnh sửa. |
| TC-COURSE-10 | Cập nhật khóa học đã published | Tạo/cập nhật draft version thay vì ghi đè bản gốc. |

**6.2.3. Kiểm thử bài học, tiến độ và quiz**

| **Mã TC** | **Dữ liệu/Thao tác** | **Kết quả mong đợi** |
| --- | --- | --- |
| TC-LESSON-01 | Bỏ trống title lesson | Trả lỗi “Tên bài học không được để trống”. |
| TC-LESSON-02 | Bỏ trống content lesson | Trả lỗi mô tả nội dung bài học. |
| TC-LESSON-03 | Bỏ trống videoUrl | Trả lỗi video bài học không được để trống. |
| TC-PROGRESS-01 | Cập nhật thời gian xem khi chưa đăng nhập | API trả HTTP 401. |
| TC-PROGRESS-02 | Gọi POST /api/progress/lesson/{id}/time hợp lệ | Tạo/cập nhật lesson_progress. |
| TC-PROGRESS-03 | Hoàn thành lesson lần đầu | Status tiến độ lesson chuyển hoàn thành và cập nhật Enrollment. |
| TC-PROGRESS-04 | Hoàn thành lại lesson đã hoàn thành | Không cộng lặp tiến độ tổng. |
| TC-QUIZ-01 | Nộp quiz khi chưa đăng nhập | API trả HTTP 401. |
| TC-QUIZ-02 | Reset quiz | Hệ thống cho phép làm lại theo quy tắc nghiệp vụ. |

**6.2.4. Kiểm thử thanh toán**

| **Mã TC** | **Dữ liệu/Thao tác** | **Kết quả mong đợi** |
| --- | --- | --- |
| TC-PAY-01 | Tạo đơn khi chưa đăng nhập | OrderService từ chối vì không xác định được user. |
| TC-PAY-02 | Gửi giá từ client thấp hơn giá database | Backend vẫn dùng course.getSalePrice(). |
| TC-PAY-03 | Coupon không hợp lệ | couponService.validateCoupon() trả lỗi. |
| TC-PAY-04 | Coupon giảm khiến tổng tiền âm | Tổng tiền được giới hạn về 0. |
| TC-PAY-05 | Đơn giá 0 | Đơn chuyển PAID, phương thức FREE/COUPON, không gọi gateway. |
| TC-PAY-06 | IPN VNPAY sai signature | Trả mã phản hồi IPN lỗi signature. |
| TC-PAY-07 | IPN VNPAY sai số tiền | Trả phản hồi invalid amount; không cập nhật đơn. |
| TC-PAY-08 | IPN hợp lệ lần đầu | Order thành PAID, lưu payment và phát event thành công. |
| TC-PAY-09 | IPN hợp lệ gửi lặp | Không tạo transaction trùng và phản hồi already processed. |

**6.2.5. Kiểm thử chức năng quản trị**

| **Mã TC** | **Dữ liệu/Thao tác** | **Kết quả mong đợi** |
| --- | --- | --- |
| TC-ADMIN-01 | User không có role ADMIN gọi /api/admin/courses/moderation | Bị từ chối bởi @PreAuthorize("hasRole('ADMIN')"). |
| TC-ADMIN-02 | Admin phê duyệt khóa học | Khóa học được cập nhật trạng thái công khai. |
| TC-ADMIN-03 | Admin từ chối khóa học, có rejectReason | Trạng thái và lý do từ chối được lưu/trả về. |
| TC-CATEGORY-01 | Tên hoặc slug danh mục trống | Bị chặn bởi validation. |
| TC-CATEGORY-02 | Tên/slug danh mục vượt 255 ký tự | Bị từ chối. |
| TC-BANNER-01 | sortOrder âm | Bị chặn bởi @Min(0). |
| TC-BANNER-02 | Status banner ngoài phạm vi 0–1 | Bị chặn bởi @Max(1). |

**6.3. Kết quả kiểm thử**

Kết quả mong đợi của quá trình kiểm thử là:

- Validation backend chặn dữ liệu sai trước khi xử lý nghiệp vụ.
- Các API yêu cầu đăng nhập trả HTTP 401 khi không có JWT hợp lệ.
- Hệ thống không tin dữ liệu giá từ frontend.
- VNPAY kiểm tra chữ ký, số tiền, trạng thái đơn hàng và chống xử lý giao dịch trùng.
- Khóa học đã xuất bản được bảo vệ bằng cơ chế versioning.
- Tiến độ học chỉ tăng khi lesson được hoàn thành lần đầu.
- Quyền truy cập dữ liệu học viên của giảng viên được giới hạn theo khóa học thuộc sở hữu của giảng viên.

**CHƯƠNG 7. TRIỂN KHAI VÀ SỬ DỤNG**

**7.1. Hướng dẫn triển khai**

Repository hiện không có Dockerfile hoặc docker-compose.yml; vì vậy, dự án được triển khai theo phương thức build trực tiếp từng phân hệ.

**7.1.1. Điều kiện môi trường**

- JDK 17.
- Node.js 18 trở lên.
- PostgreSQL.
- Redis.
- MongoDB nếu sử dụng các chức năng phụ thuộc MongoDB/AI.
- Tài khoản cấu hình SMTP Gmail, Google OAuth2, PayOS, VNPAY, Cloudinary, Bunny.net và OpenRouter.
- Maven Wrapper đã được tích hợp sẵn trong backend.

**7.1.2. Cấu hình backend**

Trong gnostica-server, tạo file .env dựa trên .env.example. Không đưa giá trị thật của các biến môi trường lên Git.

Các nhóm biến cần cấu hình:

\# PostgreSQL

DB_URL=

DB_USERNAME=

DB_PASSWORD=

\# Email và OAuth2

SPRING_MAIL_USERNAME=

SPRING_MAIL_PASSWORD=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

\# Payment

PAYOS_CLIENT_ID=

PAYOS_API_KEY=

PAYOS_CHECKSUM_KEY=

VNPAY_TMN_CODE=

VNPAY_HASH_SECRET=

VNPAY_PAYMENT_URL=

VNPAY_QUERY_URL=

VNPAY_RETURN_URL=

VNPAY_FRONTEND_RETURN_URL=

VNPAY_IPN_URL=

\# Media

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

BUNNY_STREAM_LIBRARY_ID=

BUNNY_STREAM_API_KEY=

BUNNY_STORAGE_ZONE_NAME=

BUNNY_STORAGE_API_KEY=

\# Cache, AI, MongoDB

REDIS_HOST=

REDIS_PORT=

REDIS_PASSWORD=

OPENROUTER_API_KEY=

MONGODB_URI=

Khởi tạo backend trên Windows:

cd gnostica-server

.\\mvnw.cmd test

.\\mvnw.cmd spring-boot:run

Backend mặc định chạy trên:

http://localhost:8080

Flyway được bật trong application.properties. Khi khởi động, Flyway sẽ áp dụng các migration từ src/main/resources/db/migration. spring.jpa.hibernate.ddl-auto=validate giúp backend kiểm tra schema thay vì tự ý thay đổi cấu trúc database.

Đóng gói backend:

.\\mvnw.cmd clean package

Do pom.xml cấu hình packaging là war, file kết quả nằm trong thư mục target/.

**7.1.3. Cấu hình frontend web**

Trong gnostica-web, tạo .env dựa trên .env.example:

VITE_API_URL=http://localhost:8080/api

VITE_WS_URL=

VITE_OAUTH2_URL=

Cài đặt và chạy:

cd gnostica-web

npm ci

npm run dev

Vite mặc định chạy tại:

http://localhost:5173

Build production:

npm run build

Kết quả build nằm trong thư mục dist/. Thư mục này có thể triển khai trên Nginx, Apache hoặc dịch vụ hosting static.

**7.1.4. Triển khai ứng dụng mobile**

cd gnostica-mobile

npm ci

npm run start

Một số lệnh hỗ trợ:

npm run android

npm run ios

npm run web

Khi chạy mobile trên điện thoại thật, URL API phải dùng địa chỉ IP mạng LAN hoặc domain public của backend thay vì localhost.

**7.1.5. Khuyến nghị triển khai production**

- Backend: triển khai WAR trên Tomcat hoặc chạy bằng Spring Boot trên VPS/cloud.
- Frontend: phục vụ thư mục dist/ qua Nginx.
- PostgreSQL, Redis và MongoDB: dùng managed service hoặc server riêng.
- Bắt buộc dùng HTTPS cho frontend, backend callback và VNPAY IPN.
- Đặt secret trong biến môi trường hoặc secret manager.
- Cấu hình domain thật cho VNPAY_RETURN_URL, VNPAY_IPN_URL, VITE_API_URL và OAuth2 callback.
- Thiết lập backup database, logging và giám sát lỗi.
- Không ghi hard-code thông tin kết nối, tài khoản thanh toán hay API key trong source production.

**7.2. Hướng dẫn sử dụng**

**7.2.1. Dành cho học viên**

1.  Truy cập website và chọn Đăng ký.
2.  Nhập họ tên, email và mật khẩu hợp lệ.
3.  Nhập OTP gửi về email để kích hoạt tài khoản.
4.  Đăng nhập hệ thống.
5.  Tìm kiếm hoặc chọn danh mục khóa học.
6.  Xem chi tiết khóa học và chọn mua.
7.  Áp dụng coupon nếu có.
8.  Chọn PayOS hoặc VNPAY để thanh toán.
9.  Sau khi thanh toán thành công, vào “Khóa học của tôi”.
10. Học bài học, hoàn thành lesson, làm quiz và theo dõi tiến độ.
11. Xem chứng chỉ khi đáp ứng điều kiện khóa học.

**7.2.2. Dành cho giảng viên**

1.  Đăng nhập bằng tài khoản giảng viên hoặc gửi yêu cầu trở thành giảng viên.
2.  Vào khu vực Instructor Dashboard.
3.  Tạo khóa học và nhập thông tin cơ bản.
4.  Tạo module/chương, bài học, video, tài liệu và quiz.
5.  Lưu nháp hoặc gửi khóa học để kiểm duyệt.
6.  Theo dõi trạng thái kiểm duyệt.
7.  Xem danh sách học viên và hiệu quả khóa học.
8.  Tạo coupon, theo dõi doanh thu, liên kết ngân hàng và gửi yêu cầu rút tiền.

**7.2.3. Dành cho quản trị viên**

1.  Đăng nhập bằng tài khoản có role ADMIN.
2.  Truy cập Admin Dashboard.
3.  Xem số liệu tổng quan về thành viên, đơn hàng và doanh thu.
4.  Vào Course Moderation để phê duyệt hoặc từ chối khóa học.
5.  Dùng AI scan khi cần kiểm tra nội dung.
6.  Quản lý tài khoản, danh mục, banner, trang chính sách và cấu hình hệ thống.
7.  Theo dõi đơn hàng, giao dịch, báo cáo vi phạm và yêu cầu payout.

**CHƯƠNG 8. TỔNG KẾT**

**8.1. Thuận lợi**

Nhóm chúng em đã xây dựng được một nền tảng E-Learning có phạm vi nghiệp vụ tương đối đầy đủ, không chỉ dừng ở việc hiển thị video khóa học. Các điểm nổi bật của dự án gồm:

- Áp dụng kiến trúc module rõ ràng trên Spring Boot.
- Xây dựng frontend hiện đại bằng React 19, Vite, Tailwind CSS và React Query.
- Phân quyền theo vai trò học viên, giảng viên và quản trị viên.
- Xác thực JWT stateless, mã hóa mật khẩu BCrypt và hỗ trợ OAuth2 Google.
- Có quy trình xác thực email OTP và reset mật khẩu.
- Xây dựng nghiệp vụ khóa học gồm module, lesson, attachment, question bank và quiz.
- Xây dựng cơ chế versioning khóa học để bảo vệ nội dung đang công khai.
- Theo dõi tiến độ học tập, kết quả quiz và cấp chứng chỉ.
- Tích hợp PayOS, VNPAY, webhook, IPN, xác thực chữ ký và chống ghi nhận giao dịch trùng.
- Có ví giảng viên, liên kết ngân hàng, payout và chia sẻ doanh thu.
- Tích hợp AI để chat, tạo câu hỏi và quét nội dung kiểm duyệt.
- Hỗ trợ media qua Cloudinary và Bunny.net.
- Dùng Flyway để kiểm soát phiên bản cơ sở dữ liệu.

**8.2. Khó khăn**

Trong quá trình phát triển, nhóm chúng em gặp một số khó khăn chính:

- Nghiệp vụ E-Learning có nhiều quan hệ dữ liệu phức tạp giữa course, module, lesson, quiz, enrollment, order và payment.
- Thanh toán trực tuyến là nghiệp vụ nhạy cảm; cần xử lý callback, IPN, chữ ký bảo mật, số tiền và giao dịch lặp.
- Việc cập nhật khóa học đã công khai cần bảo đảm không ảnh hưởng học viên đang học, do đó phải xây dựng versioning thay vì cập nhật trực tiếp.
- Video và tài liệu có dung lượng lớn nên cần tích hợp dịch vụ lưu trữ ngoài và xử lý dọn dẹp video mồ côi.
- Phân quyền phải được kiểm soát không chỉ ở giao diện mà còn tại backend.
- AI cần được sử dụng có kiểm soát để tránh kết quả không ổn định và chi phí phát sinh.
- Hệ thống tích hợp nhiều biến môi trường và dịch vụ bên thứ ba, làm tăng độ phức tạp khi triển khai production.

**8.3. Hướng phát triển**

Trong thời gian tới, nhóm chúng em định hướng phát triển hệ thống theo các hướng sau:

- Hoàn thiện kiểm soát phân quyền bằng @PreAuthorize nhất quán trên toàn bộ endpoint quản trị và giảng viên.
- Bổ sung refresh token, quản lý thiết bị đăng nhập và cơ chế thu hồi token.
- Tăng cường test tự động cho API, payment callback và phân quyền.
- Bổ sung CI/CD, Dockerfile, docker-compose và triển khai tự động.
- Hoàn thiện cơ chế cấp chứng chỉ PDF có mã xác minh QR.
- Phát triển recommendation engine dựa trên lịch sử học tập, yêu thích và hành vi người dùng.
- Nâng cấp AI hỗ trợ tạo giáo trình, phân tích chất lượng khóa học và trợ lý học tập cá nhân.
- Tối ưu WebSocket để cung cấp thông báo thời gian thực.
- Mở rộng báo cáo doanh thu, retention học viên và hiệu quả khóa học.
- Bổ sung đa ngôn ngữ, dark mode, accessibility và tối ưu SEO.
- Hoàn thiện đồng bộ giữa web và mobile để tạo trải nghiệm học tập đa nền tảng.
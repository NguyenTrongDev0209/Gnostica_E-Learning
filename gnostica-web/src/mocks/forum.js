export const forumPostDetailMock = {
  id: 1,
  title: "Lộ trình học ReactJS cơ bản cho người mới bắt đầu năm 2026",
  content: `
Chào mọi người! Mình mới bắt đầu tìm hiểu về lập trình Front-end và đặc biệt quan tâm tới ReactJS.

**Hoàn cảnh của mình:**
- Đã biết HTML, CSS ở mức cơ bản
- JavaScript đã nắm được các khái niệm cơ bản (biến, hàm, mảng, object, DOM)
- Chưa từng học bất kỳ framework JS nào

**Mình đang thắc mắc:**

1. Liệu có cần học thêm JS nâng cao (ES6+, async/await, Promise...) trước khi học React không hay học song song cũng được?
2. Tài nguyên nào tốt nhất để học React hiện nay (tiếng Việt hoặc tiếng Anh đều ok)?
3. Sau React thì nên học gì tiếp theo để tìm được việc làm?

Mình cảm ơn mọi người rất nhiều, rất mong nhận được sự tư vấn từ các anh chị nhiều kinh nghiệm hơn!
  `.trim(),
  author: {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    status: "online",
    postsCount: 12,
    joinedAt: "Tháng 1, 2025",
  },
  category: "Hỏi đáp lập trình",
  tags: ["ReactJS", "Frontend", "Beginner", "Lộ trình"],
  createdAt: "2 giờ trước",
  isHot: true,
  stats: { replies: 15, views: 234, likes: 45 },
};

export const forumCommentsMock = [
  {
    id: 1,
    author: {
      name: "Trần Minh Khôi",
      avatar: "https://i.pravatar.cc/150?u=b042581f4e29026024d",
      status: "online",
      role: "Senior Developer",
    },
    content: "Chào bạn! Mình có kinh nghiệm 5 năm frontend, xin chia sẻ lộ trình theo ý kiến cá nhân:\n\n**1. JS nền tảng (1-2 tháng):** Bắt buộc phải vững ES6+ trước. Học async/await và Promise là rất quan trọng vì React dùng rất nhiều.\n\n**2. React core (2-3 tháng):** Học theo tài liệu chính thức react.dev — hiện tại đã hoàn toàn dùng hooks, rất hiện đại.\n\n**3. Ecosystem:** Sau khi vững React thì học thêm React Router, Zustand/Redux, Axios/TanStack Query.\n\nChúc bạn học tốt!",
    createdAt: "1 giờ trước",
    likes: 18,
    isAccepted: true,
    replies: [
      {
        id: 11,
        author: {
          name: "Nguyễn Văn A",
          avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
          status: "online",
        },
        content: "Cảm ơn anh rất nhiều! Vậy anh có thể gợi ý thêm nguồn học JS ES6+ nào không ạ? Ưu tiên tiếng Việt nếu có.",
        createdAt: "45 phút trước",
        likes: 3,
      },
    ],
  },
  {
    id: 2,
    author: {
      name: "Lê Thị Hương",
      avatar: "https://i.pravatar.cc/150?u=c042581f4e29026024d",
      status: "offline",
      role: "Fullstack Developer",
    },
    content: "Mình bổ sung thêm: Ngoài react.dev, kênh YouTube **Jack Herrington** và **Theo - t3.gg** rất chất lượng về React hiện đại. Còn nếu thích tiếng Việt thì kênh **Evondev** và **F8** (fullstack.edu.vn) là lựa chọn tốt nhất hiện tại.",
    createdAt: "30 phút trước",
    likes: 8,
    isAccepted: false,
    replies: [],
  },
];

export const relatedForumPostsMock = [
  { id: 2, title: "Khác nhau giữa useState và useReducer trong React", category: "Hỏi đáp lập trình" },
  { id: 3, title: "Tổng hợp các câu hỏi phỏng vấn ReactJS 2026", category: "Chia sẻ kinh nghiệm" },
  { id: 4, title: "Roadmap Frontend Developer 2026 đầy đủ nhất", category: "Chia sẻ kinh nghiệm" },
];

export const forumCategoriesMock = [
  { id: 1, name: "Thảo luận chung", count: 128 },
  { id: 2, name: "Hỏi đáp lập trình", count: 342 },
  { id: 3, name: "Chia sẻ kinh nghiệm", count: 89 },
  { id: 4, name: "Tuyển dụng & Việc làm", count: 45 },
  { id: 5, name: "Góc thư giãn", count: 210 },
];

export const forumPostsMock = [
  {
    id: 1,
    title: "Lộ trình học ReactJS cơ bản cho người mới bắt đầu năm 2026",
    content: "Chào mọi người, mình mới bắt đầu tìm hiểu về lập trình Front-end và đặc biệt quan tâm tới ReactJS. Cho mình hỏi lộ trình tối ưu nhất hiện nay là gì? Mình đã biết HTML, CSS, cơ bản JS...",
    author: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      status: "online",
    },
    category: "Hỏi đáp lập trình",
    tags: ["ReactJS", "Frontend", "Beginner"],
    createdAt: "2 giờ trước",
    stats: {
      replies: 15,
      views: 234,
      likes: 45,
    },
    isHot: true,
  },
  {
    id: 2,
    title: "Review khóa học Python Data Science tại TechOne",
    content: "Mình vừa hoàn thành xong module 1 của khóa học Python Data Science. Cảm nhận chung là giảng viên rất nhiệt tình, bài tập thực tế tuy nhiên phần Pandas hơi nhanh...",
    author: {
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      status: "offline",
    },
    category: "Chia sẻ kinh nghiệm",
    tags: ["Python", "Data Science", "Review"],
    createdAt: "5 giờ trước",
    stats: {
      replies: 8,
      views: 156,
      likes: 23,
    },
    isHot: false,
  },
  {
    id: 3,
    title: "Công ty X đang tuyển thực tập sinh Web Fullstack (NodeJS/React)",
    content: "Bên mình đang có nhu cầu tuyển 5 bạn intern Fullstack Web. Yêu cầu nắm vững JS cơ bản, biết sử dụng React và Express là một lợi thế. Có lương hỗ trợ...",
    author: {
      name: "HR Tech",
      avatar: "",
      status: "online",
    },
    category: "Tuyển dụng & Việc làm",
    tags: ["Tuyển dụng", "Intern", "Fullstack"],
    createdAt: "1 ngày trước",
    stats: {
      replies: 32,
      views: 890,
      likes: 112,
    },
    isHot: true,
  },
  {
    id: 4,
    title: "Làm sao để tối ưu hóa performance trong ứng dụng NextJS?",
    content: "Dạo gần đây ứng dụng Next.js của mình load khá chậm ở các trang SSR. Mọi người có tip gì để debug và optimize hiệu suất không ạ? Cảm ơn nhiều!",
    author: {
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
      status: "online",
    },
    category: "Hỏi đáp lập trình",
    tags: ["NextJS", "Performance", "SSR"],
    createdAt: "2 ngày trước",
    stats: {
      replies: 12,
      views: 345,
      likes: 56,
    },
    isHot: false,
  },
];

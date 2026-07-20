import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Users, Calendar, Play, PlayCircle, FileText, Infinity as InfinityIcon, Smartphone, Trophy, Gift } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/micro/AppAccordion";
import Badge from "@/components/common/micro/AppBadge";
import { Button } from "@/components/common/micro/AppButton";
import { Card, CardContent } from "@/components/common/micro/AppCard";
import Separator from "@/components/common/micro/AppSeparator";
import AppProgress from "@/components/common/micro/AppProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";
import { AppButton, AppIconButton } from "@/components/common/micro/AppButton";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import PageContainer from "@/components/common/core/PageContainer";
import courseService from "@/services/course/courseService";
import instructorService from "@/services/instructor/instructorService";

// ── CourseDetailVideo ──
const BUNNY_LIBRARY_ID = "635422";

const isBunnyGuid = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const formatLessonDuration = (metadata) => {
  if (!metadata) return "--:--";

  try {
    const parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    const totalSeconds = Math.max(0, Math.round(Number(parsedMetadata?.durationSeconds)));
    if (!Number.isFinite(totalSeconds) || totalSeconds === 0) return "--:--";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
};

const CourseDetailVideo = ({ courseImage, courseTitle, promoVideo }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  if (isPlaying && promoVideo) {
    const youtubeId = getYoutubeId(promoVideo);
    const bunnyGuid = isBunnyGuid(promoVideo) ? promoVideo : null;

    return (
      <div className="relative aspect-video overflow-hidden rounded-xl shadow-2xl shadow-slate-200 border-none bg-black">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title="Course Trailer"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : bunnyGuid ? (
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${bunnyGuid}?autoplay=true&loop=false&muted=false&preload=true`}
            title="Course Trailer"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={promoVideo}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-xl shadow-2xl shadow-slate-200 group cursor-pointer border border-border/50 bg-muted"
      onClick={() => promoVideo && setIsPlaying(true)}
    >
      <img
        src={courseImage}
        alt={courseTitle}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${promoVideo ? 'group-hover:scale-105 group-hover:opacity-60' : ''}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

      {promoVideo && (
        <div className="absolute inset-0">
          <button
            type="button"
            aria-label="Phát trailer khóa học"
            className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl shadow-accent/30 md:h-14 md:w-14"
          >
            <Play
              aria-hidden="true"
              className="h-5 w-5 fill-current md:h-6 md:w-6"
              strokeWidth={0}
              viewBox="-1.333 0 24 24"
            />
          </button>
          <span className="absolute left-1/2 top-[calc(50%+2.25rem)] -translate-x-1/2 text-white font-extrabold tracking-widest uppercase text-xs md:text-sm drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Xem Trailer Khóa Học
          </span>
        </div>
      )}
    </div>
  );
};

// ── CourseDetailOutcomes ──
const CourseDetailOutcomes = ({ course }) => {
  const rating = Number(course.rating || 0).toFixed(1);
  const studentsCount = course.students ?? course.instructor?.studentsCount ?? 0;
  const updatedLabel = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("vi-VN")
    : course.lastUpdated || "Gần đây";

  return (
    <section className="bg-muted/80 border border-border/60 rounded-2xl p-6 md:p-8">
      <div className="mb-6 border-b border-border/70 pb-6">
        <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
          {course.title}
        </h1>

        <div className="mt-5 space-y-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="font-semibold text-warning">{rating}</span>
            <div className="flex items-center gap-1" aria-label={`${rating} trên 5 sao`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 text-warning ${index < Math.round(Number(rating)) ? "fill-warning" : "fill-transparent"}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{studentsCount.toLocaleString("vi-VN")} học viên</span>
            </div>
          </div>
          <p>
            Được tạo bởi{" "}
            <span className="font-semibold text-primary">
              {course.instructor?.name || "Giảng viên Gnostica"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Lần cập nhật cuối {updatedLabel}</span>
          </p>
        </div>
      </div>

      <h2 className="mb-1 text-lg font-bold text-foreground">Nội dung bài học</h2>
      <div
        className="mt-2 max-w-none text-sm font-normal leading-6 text-muted-foreground prose prose-slate md:text-base [&_p]:m-0 [&_p]:font-normal [&_p]:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
    </section>
  );
};

// ── CourseDetailCurriculum ──
const CourseDetailCurriculum = ({ curriculum }) => {
  const totalLessons = curriculum.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-foreground">Nội dung bài giảng</h2>
        <div className="text-sm text-muted-foreground font-bold bg-secondary px-4 py-2 rounded-full">
          {curriculum.length} chương • {totalLessons} bài học
        </div>
      </div>

      <Accordion
        type="multiple"
        className="w-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      >
        {curriculum.map((section, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="border-b border-border last:border-b-0"
          >
            <AccordionTrigger className="items-center px-6 py-5 transition-colors hover:bg-muted hover:no-underline [&[data-state=open]]:bg-muted/80 [&_[data-slot=accordion-trigger-icon]]:!size-6 [&_[data-slot=accordion-trigger-icon]]:self-center">
              <div className="flex items-center gap-3 text-left">
                <div className="font-extrabold text-lg text-foreground">{section.title}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-card pb-0">
              <div className="divide-y divide-slate-100/80 border-t border-border">
                {section.lessons.map((lesson, lIdx) => (
                  <div
                    key={lIdx}
                    className="flex items-center justify-between px-6 py-4 group hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.preview
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                          }`}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <span
                        className="text-[15px] font-bold text-muted-foreground"
                      >
                        {lesson.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
                      <span>{lesson.duration || ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

// ── CourseDetailInstructor ──
const CourseDetailInstructor = ({ instructor }) => {
  const navigate = useNavigate();
  return (
    <section>
      <h2 className="text-2xl font-extrabold mb-8 text-foreground">Giảng viên của bạn</h2>
      <div className="flex flex-col sm:flex-row gap-8 items-start p-8 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <Avatar className="w-32 h-32 ring-4 ring-primary/10 border-4 border-white shadow-xl">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-3 text-sm mt-2">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-warning fill-yellow-600" />
              </div>
              <span className="font-bold">{instructor.reviewsCount || 0} Đánh giá</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-info" />
              </div>
              <span className="font-bold">{instructor.studentsCount || 0} Học viên</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <PlayCircle className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-bold">{instructor.coursesCount || 0} Khóa học</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <h3 className="text-2xl font-extrabold text-foreground mb-1.5 flex items-center gap-2">
              {instructor.name}
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-1 rounded-md">
                Pro Mentor
              </span>
            </h3>
            <p className="text-muted-foreground font-bold">{instructor.role}</p>
          </div>
          <p className="text-foreground font-bold leading-relaxed text-[15px]">
            {instructor.bio}
          </p>
          <Button
            variant="outline"
            onClick={() => instructor.id && navigate(`/profile/${instructor.id}`)}
            className="mt-2 font-bold border-border text-foreground hover:text-primary hover:border-primary"
          >
            Xem hồ sơ giảng viên
          </Button>
        </div>
      </div>
    </section>
  );
};

const CourseDetailReviews = ({ course }) => {
  const reviews = Array.isArray(course.reviews) ? course.reviews : [];
  const reviewCount = course.reviewCount ?? reviews.length;
  const averageRating = Number(course.rating || 0);
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => Number(review.rating) === rating).length;
    return {
      rating,
      count,
      percentage: reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0,
    };
  });

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Đánh giá khóa học</h2>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="grid gap-8 border-b border-border pb-8 md:grid-cols-[180px_1fr] md:items-center">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-warning">{averageRating.toFixed(1)}</div>
            <div className="mt-3 flex justify-center gap-1 md:justify-start" aria-label={`${averageRating.toFixed(1)} trên 5 sao`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-5 w-5 text-warning ${index < Math.round(averageRating) ? "fill-warning" : "fill-transparent"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{reviewCount} đánh giá</p>
          </div>

          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="grid grid-cols-[52px_1fr_42px] items-center gap-3 text-sm">
                <div className="flex items-center gap-1 font-medium text-foreground">
                  <span>{item.rating}</span>
                  <Star className="h-4 w-4 fill-warning text-warning" />
                </div>
                <AppProgress
                  value={item.percentage}
                  heightClass="h-2"
                  className="[&>[data-slot=progress-indicator]]:bg-warning"
                />
                <span className="text-right text-muted-foreground">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="divide-y divide-border">
            {reviews.map((review) => (
              <article key={review.id} className="flex gap-4 py-6 last:pb-0">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={review.studentAvatar} alt={review.studentName} />
                  <AvatarFallback>{review.studentName?.charAt(0)?.toUpperCase() || "H"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground">{review.studentName || "Học viên"}</h3>
                    <time className="text-sm text-muted-foreground">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
                    </time>
                  </div>
                  <div className="mt-2 flex gap-1" aria-label={`${review.rating} trên 5 sao`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 text-warning ${index < Number(review.rating) ? "fill-warning" : "fill-transparent"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-base leading-6 text-muted-foreground">{review.comment}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="pt-8 text-center text-base text-muted-foreground">Chưa có đánh giá nào cho khóa học này.</p>
        )}
      </div>
    </section>
  );
};

// ── CourseDetailPricingCard ──
const CourseDetailPricingCard = ({ course: initialCourse }) => {
  const navigate = useNavigate();
  const totalLessons = initialCourse?.curriculum?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;

  const handleCheckout = () => {
    // Chuyển đổi giá từ chuỗi có dấu phẩy sang số nguyên
    const parsePrice = (priceStr) => {
      if (typeof priceStr === 'number') return priceStr;
      return parseInt(String(priceStr).replace(/\./g, '').replace(/,/g, ''), 10) || 0;
    };

    const orderItem = {
      id: initialCourse.id,
      title: initialCourse.title,
      instructor: initialCourse.instructor?.name || 'Ẩn danh',
      price: parsePrice(initialCourse.salePrice),
      originalPrice: parsePrice(initialCourse.originalPrice) || parsePrice(initialCourse.price),
      image: initialCourse.image,
      rating: initialCourse.rating,
      slug: initialCourse.slug,
    };

    navigate('/checkout', { state: { orderItems: [orderItem] } });
  };

  return (
    <Card appVariant="default" className="border-border/80 shadow-none rounded-2xl overflow-hidden">
      <CardContent className="px-7 pb-7 pt-5 md:px-8 md:pb-8 md:pt-5">
        <div className="mb-4 flex items-start">
          <Badge
            variant="destructive"
            className="bg-error/10 text-error hover:bg-error/10 border-none font-bold px-3 py-1"
          >
            Giảm giá {initialCourse.discount}%
          </Badge>
        </div>

        <div className="flex items-end gap-3 mb-8">
          <span className="text-[40px] leading-none font-black text-foreground tracking-tight">
            {new Intl.NumberFormat("vi-VN").format(initialCourse.salePrice)}đ
          </span>
          {initialCourse.discount > 0 && (
            <span className="text-lg text-muted-foreground line-through font-bold mb-1">
              {new Intl.NumberFormat("vi-VN").format(initialCourse.price)}đ
            </span>
          )}
        </div>

        <div className="flex items-stretch gap-3 mb-6">
          <AppButton appVariant="gradient"
            size="lg"
            className="flex-1 py-7 text-lg font-bold rounded-xl"
            onClick={handleCheckout}
            disabled={initialCourse.isEnrolled}
          >
            {initialCourse.isEnrolled ? "Đã đăng ký" : "Đăng ký học ngay"}
          </AppButton>
          <AppIconButton
            icon={Gift}
            variant="outline"
            className="flex-none !h-auto !w-auto p-4 !rounded-xl !bg-accent !text-white !border-2 !border-accent hover:!bg-accent hover:!text-white hover:!border-accent"
          />
        </div>

        <p className="text-center text-[13px] font-bold text-muted-foreground mb-8">
          Cam kết hoàn tiền trong 14 ngày nếu không hài lòng.
        </p>

        <div>
          <h4 className="font-extrabold mb-5 text-foreground text-[15px] uppercase tracking-wider">
            Khóa học này bao gồm:
          </h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 text-[15px] text-foreground font-bold">
              <PlayCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>{totalLessons} bài học trực tuyến</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-bold">
              <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Tài liệu tham khảo chuyên sâu</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-bold">
              <InfinityIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Truy cập và học tập trọn đời</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-bold">
              <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Hỗ trợ học trên điện thoại và TV</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-bold">
              <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Nhận chứng chỉ chuyên môn sau khi hoàn thành</span>
            </li>
          </ul>
        </div>

        <Separator className="my-8 bg-secondary" />

        <div className="flex flex-col gap-3">
          <button className="text-[13px] font-bold text-muted-foreground hover:text-primary transition-colors text-left flex items-center justify-between">
            Áp dụng mã giảm giá <span>+</span>
          </button>
          <button className="text-[13px] font-bold text-muted-foreground hover:text-primary transition-colors text-left flex items-center justify-between">
            Tôi muốn mua khóa học cho doanh nghiệp <span>→</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Page ──
export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseBySlug(slug);

        // Map backend model to frontend structure
        const formattedCourse = {
          id: data.id,
          category: data.categoryName || "Chưa phân loại",
          title: data.title,
          promoVideo: data.promoVideo,
          image: data.thumbnail,
          thumbnail: data.thumbnail, // Added thumbnail for consistency
          description: data.description ? data.description.replace(/&nbsp;/g, ' ') : "Chưa có mô tả chi tiết.",
          price: data.price || 0,
          salePrice: data.salePrice || data.price || 0,
          originalPrice: data.price || 0,
          discountPercentage: data.discount || 0,
          discount: data.discount || 0,
          rating: Number(data.rating || 0),
          reviewCount: Number(data.reviewCount || 0),
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          isEnrolled: data.isEnrolled || false,
          students: data.students || 0,
          updatedAt: data.updatedAt || data.updatedDate || null,
          lastUpdated: "Mới đây",
          language: "Tiếng Việt",
          outcomes: [
            "Nắm vững các kiến thức cơ bản từ lý thuyết đến thực hành",
            "Tự tin áp dụng kỹ năng vào các dự án thực tế",
            "Nhận chứng chỉ chuyên môn sau khi hoàn thành",
            "Được tham gia cộng đồng hỗ trợ học tập"
          ],
          curriculum: data.modules ? data.modules.map(module => ({
            title: module.title,
            lessons: module.lessons ? module.lessons.map(lesson => ({
              title: lesson.title,
              duration: formatLessonDuration(lesson.metadata),
              preview: false
            })) : []
          })) : [],
          instructor: {
            id: data.instructorId || "",
            name: data.instructorName || "Ẩn danh",
            avatar: data.instructorAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
            role: "Giảng viên",
            bio: "Giảng viên chia sẻ kiến thức chuyên sâu.",
            coursesCount: 1,
            studentsCount: data.students || 0,
            reviewsCount: 0,
            status: "online"
          }
        };

        setCourse(formattedCourse);

        // Fetch instructor profile nếu có instructorId
        if (data.instructorId) {
          try {
            const profileRes = await instructorService.getInstructorProfile(data.instructorId);
            setInstructorProfile(profileRes);
          } catch (profileErr) {
            console.warn("Không thể tải thông tin giảng viên:", profileErr);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết khóa học:", err);
        setError("Không thể tải thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-background min-h-screen pt-24 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">{error || "Khóa học không tồn tại"}</h2>
        <a href="/courses" className="text-primary hover:underline font-bold">Quay lại danh sách khóa học</a>
      </div>
    );
  }

  // Build instructor data: ưu tiên dữ liệu từ API profile, fallback về course data
  const instructorData = {
    id: instructorProfile?.id || course.instructor?.id || "",
    name: instructorProfile?.name || course.instructor?.name || "Giảng viên",
    avatar: instructorProfile?.avatar || course.instructor?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
    role: instructorProfile?.title || course.instructor?.role || "Chuyên gia đào tạo",
    bio: instructorProfile?.bio || course.instructor?.bio || `Giảng viên tại Gnostica với ${instructorProfile?.coursesCount || 1} khóa học và ${instructorProfile?.studentsCount || 0} học viên đã đăng ký.`,
    reviewsCount: instructorProfile?.reviewsCount || 0,
    studentsCount: instructorProfile?.studentsCount || 0,
    coursesCount: instructorProfile?.coursesCount || 1,
  };

  const breadcrumbItems = [
    { label: "Khóa học", href: "/courses" },
    { label: course.title, isLast: true },
  ];

  return (
    <PageContainer className="pb-24">
      <PageContainer.Content className="gap-y-0 pt-6 md:gap-y-0 md:pt-12">
        <div className="mb-8">
          <AppBreadcrumb
            paths={breadcrumbItems}
            className="mb-0"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          <div className="order-2 lg:order-1 lg:col-span-8 flex flex-col gap-8">
            <CourseDetailOutcomes course={course} />

            <CourseDetailCurriculum curriculum={course.curriculum || []} />

            <Separator className="bg-muted/60" />

            <CourseDetailReviews course={course} />

            <Separator className="bg-muted/60" />

            <CourseDetailInstructor instructor={instructorData} />
          </div>

          <div className="order-1 lg:order-2 lg:col-span-4 relative flex flex-col gap-6">
            <CourseDetailVideo
              courseImage={course.thumbnail}
              courseTitle={course.title}
              promoVideo={course.promoVideo}
            />

            <div className="sticky top-28 mb-12 w-full self-start lg:mb-0">
              <CourseDetailPricingCard course={course} />
            </div>
          </div>
        </div>
      </PageContainer.Content>
    </PageContainer>
  );
}

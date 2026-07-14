import React from "react";
import { useNavigate } from "react-router-dom";
import wishlistService from "@/services/course/wishlistService";
import { toast } from "sonner";
import { Star, Users, Calendar, Globe, PlayCircle, CheckCircle2, Heart, Clock, FileText, Infinity as InfinityIcon, Smartphone, Trophy, Gift } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppButton } from "@/components/common/micro/AppButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Header section for Course Detail, showing title, description and stats.
 */
export const CourseDetailHeader = ({ course }) => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-5 leading-tight">
        {course.title}
      </h1>
      {/* Tạm thời ẩn phần mô tả
      <div 
        className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed prose prose-slate max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
      */}

      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-medium">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg text-warning">
          <Star className="w-4 h-4 fill-yellow-500 text-warning" />
          <span className="font-bold">{course.rating || "4.8"}</span>
          <span className="opacity-80 underline decoration-yellow-600/30 hover:decoration-yellow-600 cursor-pointer">
            ({course.reviews || "120"} đánh giá)
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{(course.studentsCount || 0).toLocaleString()} học viên đã tham gia</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Cập nhật lần cuối {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="w-4 h-4" />
          <span>Tiếng Việt</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Course trailer/video preview area.
 */
const BUNNY_LIBRARY_ID = "635422";

// Kiểm tra xem chuỗi có phải Bunny GUID không (UUID format)
const isBunnyGuid = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Kiểm tra xem chuỗi có phải YouTube URL không
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const CourseDetailVideo = ({ courseImage, courseTitle, promoVideo }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  if (isPlaying && promoVideo) {
    const youtubeId = getYoutubeId(promoVideo);
    const bunnyGuid = isBunnyGuid(promoVideo) ? promoVideo : null;

    return (
      <div className="relative aspect-video overflow-hidden shadow-2xl shadow-slate-200 border-none bg-black">
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
      className="relative aspect-video overflow-hidden shadow-2xl shadow-slate-200 group cursor-pointer border border-border/50 bg-muted"
      onClick={() => promoVideo && setIsPlaying(true)}
    >
      <img
        src={courseImage}
        alt={courseTitle}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${promoVideo ? 'group-hover:scale-105 group-hover:opacity-60' : ''}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

      {promoVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-primary/90 group-hover:border-primary transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <PlayCircle className="w-10 h-10 md:w-12 md:h-12 fill-white text-white translate-x-0.5" />
          </div>
          <span className="text-white font-extrabold tracking-widest uppercase mt-4 text-xs md:text-sm drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            Xem Trailer Khóa Học
          </span>
        </div>
      )}
    </div>
  );

  if (!promoVideo) return content;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {content}
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none ring-0 sm:max-w-[85vw] md:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{courseTitle} - Trailer</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full flex items-center justify-center bg-black">
          {useIframe ? (
            <iframe
              width="100%"
              height="100%"
              src={`${embedUrl}?autoplay=true`}
              title={`${courseTitle} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <video
              src={promoVideo}
              controls
              autoPlay
              className="w-full h-full"
              poster={courseImage}
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * "What you'll learn" section for Course Detail.
 */
export const CourseDetailOutcomes = ({ course }) => {
  return (
    <section className="bg-muted/80 border border-border/60 rounded-[24px] p-6 md:p-10">
      <h2 className="text-2xl font-extrabold mb-6 text-foreground">Nội dung bài học</h2>
      <div
        className="text-foreground text-[15px] leading-relaxed prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
    </section>
  );
};

/**
 * Course curriculum with expandable accordion sections.
 */
export const CourseDetailCurriculum = ({ curriculum }) => {
  const totalLessons = curriculum.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-foreground">Nội dung bài giảng</h2>
        <div className="text-sm text-muted-foreground font-semibold bg-secondary px-4 py-2 rounded-full">
          {curriculum.length} chương • {totalLessons} bài học
        </div>
      </div>

      <Accordion
        type="multiple"
        className="w-full bg-white border border-border rounded-[20px] overflow-hidden shadow-sm"
      >
        {curriculum.map((section, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="border-b border-border last:border-b-0"
          >
            <AccordionTrigger className="px-6 py-5 hover:bg-muted hover:no-underline [&[data-state=open]]:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3 text-left">
                <div className="font-extrabold text-lg text-foreground">{section.title}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white pb-0">
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
                        className="text-[15px] font-semibold text-muted-foreground"
                      >
                        {lesson.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
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

/**
 * Instructor profile and bio section.
 */
export const CourseDetailInstructor = ({ instructor }) => {
  const navigate = useNavigate();
  return (
    <section>
      <h2 className="text-2xl font-extrabold mb-8 text-foreground">Giảng viên của bạn</h2>
      <div className="flex flex-col sm:flex-row gap-8 items-start p-8 rounded-[24px] bg-white border border-border shadow-sm">
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
            <p className="text-muted-foreground font-medium">{instructor.role}</p>
          </div>
          <p className="text-foreground leading-relaxed text-[15px]">
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

/**
 * Sticky pricing card for Course Detail.
 */
export const CourseDetailPricingCard = ({ course: initialCourse }) => {
  const navigate = useNavigate();
  const [isFavourite, setIsFavourite] = React.useState(initialCourse?.isFavourite || false);
  const [isToggling, setIsToggling] = React.useState(false);

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

  const handleToggleWishlist = async () => {
    if (isToggling) return;
    try {
      setIsToggling(true);
      const res = await wishlistService.toggleWishlist(initialCourse.id);
      if (res.success) {
        setIsFavourite(res.data.isFavourite);
        if (res.data.isFavourite) {
          toast.success("Đã thêm vào danh sách yêu thích");
        } else {
          toast.info("Đã xóa khỏi danh sách yêu thích");
        }
      }
    } catch (error) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-2xl shadow-slate-200/50 rounded-[28px] overflow-hidden bg-white">
      <CardContent className="p-7 md:p-8">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant="destructive"
            className="bg-error/10 text-error text-error hover:bg-error/10 text-error border-none font-bold px-3 py-1"
          >
            Giảm giá {initialCourse.discount}%
          </Badge>
          <button
            onClick={handleToggleWishlist}
            disabled={isToggling}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavourite
                ? "bg-red-50 text-error shadow-sm"
                : "bg-muted text-muted-foreground hover:text-error hover:bg-red-50"
              }`}
          >
            <Heart className={`w-5 h-5 ${isFavourite ? "fill-red-500" : ""}`} />
          </button>
        </div>

        <div className="flex items-end gap-3 mb-8 mt-4">
          <span className="text-[40px] leading-none font-black text-foreground tracking-tight">
            {new Intl.NumberFormat("vi-VN").format(initialCourse.salePrice)}đ
          </span>
          {initialCourse.discount > 0 && (
            <span className="text-lg text-muted-foreground line-through font-semibold mb-1">
              {new Intl.NumberFormat("vi-VN").format(initialCourse.price)}đ
            </span>
          )}
        </div>

        <div className="flex items-stretch gap-3 mb-6">
          <AppButton appVariant="gradient"
            size="lg"
            className="flex-1 py-7 text-lg font-bold rounded-2xl"
            onClick={handleCheckout}
            disabled={initialCourse.isEnrolled}
          >
            {initialCourse.isEnrolled ? "Đã đăng ký" : "Đăng ký học ngay"}
          </AppButton>
          <button
            className="flex-none p-4 rounded-2xl border-2 border-border text-foreground hover:bg-muted hover:text-primary hover:border-primary transition-all flex items-center justify-center cursor-pointer"
          >
            <Gift className="size-6" />
          </button>
        </div>

        <p className="text-center text-[13px] font-semibold text-muted-foreground mb-8">
          Cam kết hoàn tiền trong 30 ngày nếu không hài lòng.
        </p>

        <div>
          <h4 className="font-extrabold mb-5 text-foreground text-[15px] uppercase tracking-wider">
            Khóa học này bao gồm:
          </h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 text-[15px] text-foreground font-medium">
              <PlayCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>{totalLessons} bài học trực tuyến</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-medium">
              <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Tài liệu tham khảo chuyên sâu</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-medium">
              <InfinityIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Truy cập và học tập trọn đời</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-medium">
              <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Hỗ trợ học trên điện thoại và TV</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-foreground font-medium">
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

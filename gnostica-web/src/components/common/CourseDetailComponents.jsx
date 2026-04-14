import React from "react";
import { Star, Users, Calendar, Globe, PlayCircle, CheckCircle2, Heart, Clock, FileText, Infinity as InfinityIcon, Smartphone, Trophy } from "lucide-react";
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
import { SimpleButton } from "@/components/common/AppButton";

/**
 * Header section for Course Detail, showing title, description and stats.
 */
export const CourseDetailHeader = ({ course }) => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
        {course.title}
      </h1>
      {/* Tạm thời ẩn phần mô tả
      <div 
        className="text-lg md:text-xl text-slate-600 mb-6 leading-relaxed prose prose-slate max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
      */}

      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-medium">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg text-yellow-700">
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          <span className="font-bold">{course.rating}</span>
          <span className="opacity-80 underline decoration-yellow-600/30 hover:decoration-yellow-600 cursor-pointer">
            ({course.reviews} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-4 h-4" />
          <span>{course.students.toLocaleString()} students enrolled</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>Last updated {course.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Globe className="w-4 h-4" />
          <span>{course.language}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Course trailer/video preview area.
 */
export const CourseDetailVideo = ({ courseImage, courseTitle, promoVideo }) => {
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Regex kiểm tra mã UUID (Video ID đơn thuần)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const libraryId = "635422";

    if (uuidRegex.test(url)) {
      return `https://player.mediadelivery.net/embed/${libraryId}/${url}`;
    }

    // Chuyển đổi link chia sẻ Bunny.net sang link nhúng
    if (url.includes("video.bunny.net/play/") || url.includes("video.bunny.net/embed/")) {
      return url
        .replace("video.bunny.net/play/", "player.mediadelivery.net/embed/")
        .replace("video.bunny.net/embed/", "player.mediadelivery.net/embed/");
    }

    // Đảm bảo domain mới nhất cho mediadelivery
    if (url.includes("iframe.mediadelivery.net")) {
      return url.replace("iframe.mediadelivery.net", "player.mediadelivery.net");
    }

    return url;
  };

  const isEmbedLink = (url) => {
    if (!url) return false;
    // UUID luôn là embed link cho Bunny.net
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(url)) return true;

    const lowUrl = url.toLowerCase();
    return (
      lowUrl.includes("mediadelivery.net") || 
      lowUrl.includes("bunny.net") ||
      lowUrl.includes("b-cdn.net") ||
      lowUrl.includes("vimeo.com")
    );
  };

  const embedUrl = getEmbedUrl(promoVideo);
  const useIframe = isEmbedLink(promoVideo);

  // Debug URL cuối cùng
  React.useEffect(() => {
    if (promoVideo) {
      console.log("Original Video Value:", promoVideo);
      console.log("Final Embed URL:", embedUrl);
    }
  }, [promoVideo, embedUrl]);

  const content = (
    <div className={`relative aspect-video rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200 group border border-slate-100/50 bg-slate-900 ${promoVideo ? 'cursor-pointer' : ''}`}>
      <img
        src={courseImage}
        alt={courseTitle}
        className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 ease-out"
      />
      {promoVideo && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-primary/90 group-hover:border-primary transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
              <PlayCircle className="w-10 h-10 md:w-12 md:h-12 fill-white text-white translate-x-0.5" />
            </div>
            <span className="text-white font-extrabold tracking-widest uppercase mt-4 text-xs md:text-sm drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              Xem Trailer Khóa Học
            </span>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * "What you'll learn" section for Course Detail.
 */
export const CourseDetailOutcomes = ({ outcomes }) => {
  return (
    <section className="bg-slate-50/80 border border-slate-200/60 rounded-[24px] p-6 md:p-10">
      <h2 className="text-2xl font-extrabold mb-6 text-slate-900">Mục tiêu khóa học</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {outcomes.map((outcome, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-slate-700 text-[15px] leading-relaxed font-medium">
              {outcome}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * Course curriculum with expandable accordion sections.
 */
export const CourseDetailCurriculum = ({ curriculum }) => {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Nội dung bài giảng</h2>
        <div className="text-sm text-slate-600 font-semibold bg-slate-100 px-4 py-2 rounded-full">
          3 chương • 12 bài học • Thời lượng: 4h 25m
        </div>
      </div>

      <Accordion
        type="multiple"
        className="w-full bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-sm"
      >
        {curriculum.map((section, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="border-b border-slate-100 last:border-b-0"
          >
            <AccordionTrigger className="px-6 py-5 hover:bg-slate-50 hover:no-underline [&[data-state=open]]:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3 text-left">
                <div className="font-extrabold text-lg text-slate-900">{section.title}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white pb-0">
              <div className="divide-y divide-slate-100/80 border-t border-slate-100">
                {section.lessons.map((lesson, lIdx) => (
                  <div
                    key={lIdx}
                    className="flex items-center justify-between px-6 py-4 group hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          lesson.preview
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[15px] font-semibold ${
                          lesson.preview
                            ? "text-slate-900 group-hover:text-primary transition-colors cursor-pointer"
                            : "text-slate-600"
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                      {lesson.preview && (
                        <button className="text-primary font-bold hover:underline hidden sm:block">
                          Học thử
                        </button>
                      )}
                      <span>{lesson.duration}</span>
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
  return (
    <section>
      <h2 className="text-2xl font-extrabold mb-8 text-slate-900">Giảng viên của bạn</h2>
      <div className="flex flex-col sm:flex-row gap-8 items-start p-8 rounded-[24px] bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <Avatar className="w-32 h-32 ring-4 ring-primary/10 border-4 border-white shadow-xl">
            <AvatarImage src={instructor.avatar} />
            <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-3 text-sm mt-2">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              </div>
              <span className="font-bold">{instructor.reviewsCount} Đánh giá</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-bold">{instructor.studentsCount} Học viên</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <PlayCircle className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-bold">{instructor.coursesCount} Khóa học</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1.5 flex items-center gap-2">
              {instructor.name}
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-black px-2 py-1 rounded-md">
                Pro Mentor
              </span>
            </h3>
            <p className="text-slate-500 font-medium">{instructor.role}</p>
          </div>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            {instructor.bio}
          </p>
          <Button
            variant="outline"
            className="mt-2 font-bold border-slate-300 text-slate-700 hover:text-primary hover:border-primary"
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
export const CourseDetailPricingCard = ({ course }) => {
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <Card className="border-slate-200/80 shadow-2xl shadow-slate-200/50 rounded-[28px] overflow-hidden bg-white">
      <CardContent className="p-7 md:p-8">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-600 hover:bg-red-100 border-none font-bold px-3 py-1"
          >
            Giảm giá {course.discountPercentage}%
          </Badge>
          <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-end gap-3 mb-8 mt-4">
          <span className="text-[40px] leading-none font-black text-slate-900 tracking-tight">
            {course.price}đ
          </span>
          <span className="text-lg text-slate-400 line-through font-semibold mb-1">
            {course.originalPrice}đ
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <SimpleButton className="w-full py-7 text-lg font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            Đăng ký học ngay
          </SimpleButton>
        </div>

        <p className="text-center text-[13px] font-semibold text-slate-500 mb-8">
          Cam kết hoàn tiền trong 30 ngày nếu không hài lòng.
        </p>

        <div>
          <h4 className="font-extrabold mb-5 text-slate-900 text-[15px] uppercase tracking-wider">
            Khóa học này bao gồm:
          </h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 text-[15px] text-slate-700 font-medium">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>24.5 giờ video bài giảng chất lượng cao</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-slate-700 font-medium">
              <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>12 bài tập thực hành & 15 tài liệu tham khảo</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-slate-700 font-medium">
              <InfinityIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Truy cập và học tập trọn đời</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-slate-700 font-medium">
              <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Hỗ trợ học trên điện thoại và TV</span>
            </li>
            <li className="flex items-start gap-4 text-[15px] text-slate-700 font-medium">
              <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Nhận chứng chỉ chuyên môn sau khi hoàn thành</span>
            </li>
          </ul>
        </div>

        <Separator className="my-8 bg-slate-100" />

        <div className="flex flex-col gap-3">
          <button className="text-[13px] font-bold text-slate-500 hover:text-primary transition-colors text-left flex items-center justify-between">
            Áp dụng mã giảm giá <span>+</span>
          </button>
          <button className="text-[13px] font-bold text-slate-500 hover:text-primary transition-colors text-left flex items-center justify-between">
            Tôi muốn mua khóa học cho doanh nghiệp <span>→</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

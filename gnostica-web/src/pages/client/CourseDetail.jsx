import React from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  Users, 
  Globe, 
  Info, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  Clock, 
  Infinity as InfinityIcon, 
  Smartphone, 
  Trophy,
  ChevronRight,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimpleButton } from "@/components/common/AppButton";
import { AppBreadcrumb } from "@/components/common/AppSection";
import { Home } from "lucide-react";
import { getCourseDetailById } from "@/mocks/courses";

export default function CourseDetail() {
  const { id } = useParams();
  const course = getCourseDetailById(id || "1");

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", href: "/courses" },
    { label: course.category, isLast: true }
  ];

  return (
    <div className="relative pb-20 bg-background">
      {/* 1. Hero Section (Header) */}
      <section className="bg-slate-900 py-12 lg:py-16 text-white overflow-hidden">
        <div className="app-container lg:pr-[400px]">
          {/* Breadcrumbs */}
          <AppBreadcrumb 
            items={breadcrumbItems} 
            linkClassName="text-slate-400 hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-slate-500"
          />

          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 transition-all duration-300">
            {course.title}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm md:text-base">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-yellow-400">{course.rating}</span>
              <span className="text-slate-400 underline decoration-slate-600">({course.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-5 h-5 text-slate-400" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span className="text-slate-400">Created by</span>
              <span className="text-primary font-bold">{course.instructor.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Last updated {course.lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>{course.language}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Sticky Sidebar */}
      <div className="lg:app-container lg:relative">
        <aside className="static lg:absolute lg:right-4 lg:-top-64 w-full lg:w-[350px] z-50 px-4 lg:px-0 mt-8 lg:mt-0">
          <Card className="shadow-2xl border-white shadow-orange-500/10 overflow-hidden bg-card">
            {/* Preview Image */}
            <div className="relative aspect-video group cursor-pointer">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 transition-opacity">
                <div className="text-white flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 fill-white text-white" />
                  </div>
                  <span className="font-bold text-sm">Preview this course</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-extrabold bg-button-gradient bg-clip-text text-transparent italic">
                  {course.price}đ
                </span>
                <span className="text-lg text-slate-400 line-through">
                  {course.originalPrice}đ
                </span>
                <Badge variant="destructive" className="bg-red-500 text-white border-none font-bold">
                  -{course.discountPercentage}% OFF
                </Badge>
              </div>

              <div className="space-y-4">
                <SimpleButton className="w-full py-6 text-lg" size="lg">
                  Buy Now
                </SimpleButton>
                <Button variant="outline" className="w-full py-6 text-lg border-slate-200 hover:bg-slate-50">
                  Add to Cart
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500 mt-4">
                30-Day Money-Back Guarantee
              </p>

              <div className="mt-8">
                <h4 className="font-bold mb-4 text-slate-900">This course includes:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>24.5 hours on-demand video</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>12 articles & 15 resources</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <InfinityIcon className="w-4 h-4 text-primary" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span>Access on mobile and TV</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-around gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                <button className="hover:underline">Share</button>
                <button className="hover:underline">Gift Course</button>
                <button className="hover:underline">Apply Coupon</button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* 3. Main Content Area */}
      <main className="app-container mt-12 lg:pr-[400px]">
        {/* Learning Outcomes */}
        <section className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">What you'll learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {course.outcomes.map((outcome, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-slate-700 text-sm leading-relaxed">{outcome}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Curriculum Section */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Course Content</h2>
            <div className="text-sm text-slate-500 font-medium">
              3 sections • 12 lectures • 4h 25m total length
            </div>
          </div>
          
          <Accordion type="multiple" className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
            {course.curriculum.map((section, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b last:border-b-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline [&[data-state=open]]:bg-slate-50">
                  <div className="flex items-center gap-3 text-left">
                    <div className="font-bold text-lg text-slate-800">{section.title}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-white">
                  <div className="divide-y divide-slate-100">
                    {section.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between px-6 py-4 group hover:bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400">
                            {lesson.preview ? <PlayCircle className="w-4 h-4 text-primary" /> : <PlayCircle className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm ${lesson.preview ? 'text-primary font-medium' : 'text-slate-600'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {lesson.preview && (
                            <button className="text-primary font-bold underline hover:no-underline">Preview</button>
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

        <Separator className="my-12" />

        {/* Instructor Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">Instructor</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <Avatar className="w-32 h-32 ring-4 ring-orange-500/10 border-4 border-white shadow-xl">
                <AvatarImage src={course.instructor.avatar} />
                <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="font-bold">{course.instructor.reviewsCount} Instructor Rating</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-bold">{course.instructor.studentsCount} Students</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <PlayCircle className="w-4 h-4 text-primary" />
                  <span className="font-bold">{course.instructor.coursesCount} Courses</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-primary underline decoration-primary/30 underline-offset-4 mb-1">
                  {course.instructor.name}
                </h3>
                <p className="text-slate-400 font-medium italic">{course.instructor.role}</p>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {course.instructor.bio}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

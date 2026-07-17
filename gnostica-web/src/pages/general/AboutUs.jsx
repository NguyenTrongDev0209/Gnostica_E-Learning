import React from "react";
import { TestimonialCarousel } from "@/components/common/composite/TestimonialCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Monitor } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { Home } from "lucide-react";

// Mock Data
import {
  aboutToolsMock,
  aboutStepsMock,
  aboutHeroMock,
  aboutVisionMock,
  aboutCTAMock
} from "@/mocks/staticPages";

// ── AboutHero ──
function AboutHero({ data }) {
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Về chúng tôi", isLast: true }
  ];

  return (
    <section className="app-container py-6 md:py-12">
      <div className="mb-6 md:mb-10">
        <AppBreadcrumb paths={breadcrumbItems} />
      </div>
      <div className="grid md:grid-cols-2 items-center gap-6">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {data.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            {data.title} <span className="bg-accent-gradient bg-clip-text text-transparent italic">{data.highlight}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <AppButton appVariant="gradient" size="lg" className="min-w-[120px] shadow-lg shadow-orange-500/20">
              {data.primaryCta}
            </AppButton>
            <AppButton appVariant="gradient" size="lg" variant="outline" className="min-w-[120px] bg-transparent border-warning/20 text-warning hover:bg-orange-50">
              {data.secondaryCta}
            </AppButton>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-[4/3] bg-primary text-primary-foreground rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center transform transition-all hover:scale-[1.02] cursor-pointer">
           <div className="text-white text-center flex flex-col items-center gap-4">
               <div className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center opacity-40">
                <Monitor size={48} />
              </div>
              <span className="text-xl md:text-3xl font-black tracking-widest uppercase opacity-80">HỢP TÁC</span>
           </div>
           {/* Decorative hand icon simulation */}
           <div className="absolute bottom-12 right-12 w-32 h-16 border-b-4 border-white/30 rounded-full rotate-[-15deg]"></div>
        </div>
      </div>
    </section>
  );
}

// ── AboutTools ──
function AboutTools({ tools }) {
  return (
    <section className="bg-muted py-8">
      <div className="app-container">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Công cụ Học tập Chuyên biệt của Chúng tôi</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Công nghệ tiên tiến kết hợp với thiết kế tinh tế để mang lại hành trình giáo dục liền mạch, phù hợp với tiềm năng độc nhất của bạn.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const ToolIcon = tool.icon;
            return (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-gradient text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <ToolIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tool.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <Button variant="link" className="p-0 h-auto bg-accent-gradient bg-clip-text text-transparent font-bold w-fit group-hover:gap-2 transition-all">
                    Đọc thêm <ArrowRight className="ml-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-warning" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── AboutSolutions ──
function AboutSolutions({ steps }) {
  return (
    <section className="app-container py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 items-center gap-6 lg:gap-10">
        <div className="aspect-square bg-primary text-primary-foreground rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
          <div className="text-white text-center p-8 z-10">
             <h4 className="text-2xl font-black tracking-wide mb-2 opacity-60">TẦM NHÌN</h4>
             <div className="w-16 h-0.5 bg-primary/50 mx-auto mb-4"></div>
             <p className="text-sm tracking-[0.2em] opacity-40">BƯỚC ĐẾN THÀNH CÔNG</p>
          </div>
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="bg-accent-gradient bg-clip-text text-transparent font-bold tracking-widest text-xs uppercase">CÁCH CHÚNG TÔI LÀM VIỆC</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">Giải pháp Học tập Đơn giản!</h2>
          </div>
          <div className="flex flex-col gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-accent-gradient flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/10">
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-foreground">{step.title}</h4>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4">
            <AppButton appVariant="gradient" size="lg" className="min-w-[120px]">Tìm hiểu thêm</AppButton>
            <AppButton appVariant="gradient" size="lg" variant="outline" className="min-w-[120px] bg-transparent border-warning/20 text-warning hover:bg-orange-50">Triết lý của Chúng tôi</AppButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── AboutVision ──
function AboutVision({ data }) {
  return (
    <section className="bg-primary/5 py-10">
      <div className="app-container">
        <div className="grid lg:grid-cols-2 items-center gap-8">
          <div className="flex flex-col gap-8">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">{data.title}</h2>
            <div className="flex flex-col gap-6 text-muted-foreground leading-relaxed">
              {data.paragraphs.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>
            <div className="border-l-4 border-warning/20/50 pl-6 py-2 italic font-medium text-foreground bg-white/50 rounded-r-lg">
              "{data.quote}"
              <div className="text-xs bg-accent-gradient bg-clip-text text-transparent font-bold mt-2 uppercase tracking-widest">— {data.author}</div>
            </div>
          </div>
          <div className="aspect-square bg-primary text-primary-foreground rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center group">
             <div className="flex flex-col items-center gap-4 text-white p-12">
                <div className="w-20 h-28 border border-white/20 rounded-t-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-warning/10 text-warning shadow-glow"></div>
                </div>
                <div className="text-sm tracking-[0.4em] opacity-40 uppercase">CÁNH CỬA NGHỀ NGHIỆP</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── AboutCTA ──
function AboutCTA({ data }) {
  return (
    <section className="app-container pb-8">
      <div className="w-full bg-accent-gradient md:bg-primary rounded-[2rem] py-8 px-6 text-center text-white flex flex-col items-center gap-4 shadow-2xl shadow-primary/30 relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight relative z-10">{data.title}</h2>
        <p className="text-white/80 max-w-xl text-lg relative z-10">
          {data.description}
        </p>
        <AppButton appVariant="gradient" size="lg" variant="secondary" className="py-2 text-warning h-auto font-bold text-lg hover:scale-105 transition-transform bg-white border-none shadow-xl mt-4 relative z-10">
          {data.buttonText}
        </AppButton>
      </div>
    </section>
  );
}

// ── Page ──
export default function AboutUs() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <AboutHero data={aboutHeroMock} />

      <AboutTools tools={aboutToolsMock} />

      <AboutSolutions steps={aboutStepsMock} />

      <AboutVision data={aboutVisionMock} />

      <section className="py-10">
        <TestimonialCarousel />
      </section>

      <AboutCTA data={aboutCTAMock} />
    </div>
  );
}

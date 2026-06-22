import React from "react";
import { Badge } from "@/components/ui/badge";
import { Monitor, Home } from "lucide-react";
import { SimpleButton } from "@/components/common/AppButton";
import { AppBreadcrumb } from "@/components/common/AppSection";

export default function AboutHero({ data }) {
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Về chúng tôi", isLast: true }
  ];

  return (
    <section className="app-container py-6 md:py-12">
      <AppBreadcrumb 
        items={breadcrumbItems} 
        className="mb-6 md:mb-10" 
      />
      <div className="grid md:grid-cols-2 items-center gap-6">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {data.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            {data.title} <span className="bg-button-gradient bg-clip-text text-transparent italic">{data.highlight}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            {data.description}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <SimpleButton size="lg" className="min-w-[120px] shadow-lg shadow-orange-500/20">
              {data.primaryCta}
            </SimpleButton>
            <SimpleButton size="lg" variant="outline" className="min-w-[120px] bg-transparent border-warning/20 text-warning hover:bg-orange-50">
              {data.secondaryCta}
            </SimpleButton>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-[4/3] bg-teal-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center transform transition-all hover:scale-[1.02] cursor-pointer">
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

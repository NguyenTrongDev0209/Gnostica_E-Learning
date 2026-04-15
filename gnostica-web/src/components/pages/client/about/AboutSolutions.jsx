import React from "react";
import { SimpleButton } from "@/components/common/AppButton";

export default function AboutSolutions({ steps }) {
  return (
    <section className="app-container py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 items-center gap-6 lg:gap-10">
        <div className="aspect-square bg-neutral-900 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
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
            <span className="bg-button-gradient bg-clip-text text-transparent font-bold tracking-widest text-xs uppercase">CÁCH CHÚNG TÔI LÀM VIỆC</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Giải pháp Học tập Đơn giản!</h2>
          </div>
          <div className="flex flex-col gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-button-gradient flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/10">
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-slate-900">{step.title}</h4>
                  <p className="text-slate-500 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4">
            <SimpleButton size="lg" className="min-w-[120px]">Tìm hiểu thêm</SimpleButton>
            <SimpleButton size="lg" variant="outline" className="min-w-[120px] bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50">Triết lý của Chúng tôi</SimpleButton>
          </div>
        </div>
      </div>
    </section>
  );
}

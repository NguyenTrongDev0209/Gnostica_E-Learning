import React from "react";
import { SimpleButton } from "@/components/common/AppButton";

export default function AboutCTA({ data }) {
  return (
    <section className="app-container pb-8">
      <div className="w-full bg-button-gradient md:bg-primary rounded-[2rem] py-8 px-6 text-center text-white flex flex-col items-center gap-4 shadow-2xl shadow-primary/30 relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight relative z-10">{data.title}</h2>
        <p className="text-white/80 max-w-xl text-lg relative z-10">
          {data.description}
        </p>
        <SimpleButton size="lg" variant="secondary" className="py-2 text-warning h-auto font-bold text-lg hover:scale-105 transition-transform bg-white border-none shadow-xl mt-4 relative z-10">
          {data.buttonText}
        </SimpleButton>
      </div>
    </section>
  );
}

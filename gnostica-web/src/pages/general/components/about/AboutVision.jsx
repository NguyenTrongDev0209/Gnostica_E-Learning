import React from "react";

export default function AboutVision({ data }) {
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
          <div className="aspect-square bg-card text-card-foreground rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center group">
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

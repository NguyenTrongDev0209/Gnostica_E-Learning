import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function AboutTools({ tools }) {
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
                  <div className="w-12 h-12 rounded-xl bg-button-gradient text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <ToolIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tool.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <Button variant="link" className="p-0 h-auto bg-button-gradient bg-clip-text text-transparent font-bold w-fit group-hover:gap-2 transition-all">
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

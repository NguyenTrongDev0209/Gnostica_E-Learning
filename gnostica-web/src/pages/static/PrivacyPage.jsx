import React from "react";
import { Link } from "react-router-dom";
import { Home, Shield } from "lucide-react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { privacySectionsMock } from "@/apiMocks/staticPages";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="bg-muted py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb 
            paths={[
              { label: "Trang chủ", href: "/" },
              { label: "Chính sách bảo mật" }
            ]} 
          />
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Chính sách bảo mật
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Cập nhật lần cuối: 24 tháng 3, 2026</p>
        </div>
      </section>

      {/* Main */}
      <main className="app-container max-w-3xl mt-10">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-6 sm:p-10 space-y-8">
          {privacySectionsMock.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-foreground mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              )}
              {section.items && (
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

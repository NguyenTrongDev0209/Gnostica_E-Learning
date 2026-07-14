import React from 'react';
import { ArrowRight } from 'lucide-react';

const OutcomeBanner = () => {
    return (
        <div className="w-full mt-12 bg-foreground rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-10 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>

            {/* Left Content */}
            <div className="flex flex-col gap-3 z-10 max-w-lg text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold text-background leading-tight">
                    95% học viên đạt được mục tiêu nghề nghiệp
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    Học viên ghi nhận những cơ hội việc làm mới và kiến thức chuyên môn được nâng cao rõ rệt sau khóa học tại Gnostica.
                </p>
                <div className="mt-2">
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 text-background font-bold hover:text-primary transition-all text-sm md:text-base group"
                    >
                        Khám phá lộ trình học tập
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </a>
                </div>
            </div>

            {/* Right Graphic */}
            <div className="relative flex items-center justify-center">
                <div className="relative w-36 h-36 md:w-44 md:h-44">
                    {/* SVG Graphic */}
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Outer Glow Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="42%"
                            fill="transparent"
                            className="stroke-primary/10"
                            strokeWidth="1"
                        />
                        {/* Main Progress Background */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="32%"
                            className="fill-background/10 stroke-background/5"
                            strokeWidth="10"
                        />
                        {/* Progress Line */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="32%"
                            fill="transparent"
                            stroke="url(#banner-gradient)"
                            strokeWidth="10"
                            strokeDasharray="201"
                            strokeDashoffset="10"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="banner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className="text-primary" stopColor="currentColor" />
                                <stop offset="100%" className="text-success" stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl md:text-3xl font-black text-background">95%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutcomeBanner;

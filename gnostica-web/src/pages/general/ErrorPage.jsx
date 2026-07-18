import React from 'react';
import { Link } from 'react-router-dom';
import { AppButton } from "@/components/common/micro/AppButton";
import PageContainer from "@/components/common/core/PageContainer";

const ErrorPage = () => {
  return (
    <PageContainer className="relative items-center justify-center overflow-hidden font-sans">
      {/* City Skyline Background (SVG) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-end justify-center">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-auto max-h-[60vh] text-primary/30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simple hand-drawn style city skyline */}
          <path
            d="M0 580h1200M50 580V450h80v130M150 580V380h100v200M280 580V480h70v100M370 580V350h120v230M510 580V500h60v80M600 580V250h150v330M780 580V450h90v130M900 580V380h110v200M1050 580V520h80v60M200 380l50-40 50 40M650 250l75-60 75 60M430 350l60-40 60 40"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Details like windows */}
          <path d="M60 470h20M60 500h20M60 530h20M170 410h20M170 440h20M170 470h20M170 500h20M170 530h20M170 560h20M620 280h30M620 320h30M620 360h30M620 400h30M620 440h30M620 480h30M620 520h30" stroke="currentColor" strokeWidth="1" />
          {/* Clouds */}
          <path d="M100 150c0-20 30-20 40 0 10-10 40-10 40 10 0 10-20 30-40 30h-40c-20 0-40-20-40-40zM900 120c0-15 25-15 35 0 8-8 32-8 32 8 0 8-16 24-32 24h-32c-16 0-32-16-32-32z" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 -mt-24 md:-mt-32">
        {/* 404 Text */}
        <h1 className="text-[120px] md:text-[200px] font-black leading-none select-none animate-in fade-in zoom-in duration-700 bg-accent-gradient bg-clip-text text-transparent">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 tracking-tight">
          Oops! Không tìm thấy trang này.
        </h2>

        {/* Subtext */}
        <p className="text-muted-foreground mt-4 max-w-md mx-auto text-lg font-medium">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>

        {/* Back Button */}
        <div className="mt-10 flex justify-center">
          <Link to="/">
            <AppButton appSize="lg" appVariant="gradient" className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              Quay về trang chủ
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Subtle bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </PageContainer>
  );
};

export default ErrorPage;

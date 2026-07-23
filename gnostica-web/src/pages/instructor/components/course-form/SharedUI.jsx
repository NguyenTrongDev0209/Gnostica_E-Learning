import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

export function CourseStepper({ activeTab, onTabChange }) {
  const { control } = useFormContext();

  const watchedValues = useWatch({
    control,
    name: [
      "title",
      "description",
      "sections",
      "thumbnail",
      "promoVideo",
      "price",
      "questionBank",
    ],
  });

  const steps = React.useMemo(() => {
    const formValues = watchedValues || [];
    // Basic Info Progress
    const basicFields = [formValues[0], formValues[1]];
    const basicFilled = basicFields.filter((f) => f && f.length > 0).length;
    const basicPercent = (basicFilled / 2) * 100;

    // Curriculum Progress (at least one section with title)
    const sections = formValues[2] || [];
    const curriculumPercent = sections.some(
      (s) => s.title && s.title.length > 0,
    )
      ? 100
      : 0;

    // Media Progress (thumbnail and promoVideo)
    const mediaFields = [formValues[3], formValues[4]];
    const mediaFilled = mediaFields.filter(
      (f) => f !== null && f !== undefined,
    ).length;
    const mediaPercent = (mediaFilled / 2) * 100;

    // Pricing Progress
    const price = formValues[5];
    const pricingPercent = price && price > 0 ? 100 : 0;

    const settingsPercent = (mediaPercent + pricingPercent) / 2;

    // Quiz Progress
    const questionBank = formValues[6];
    const quizPercent = (questionBank && questionBank.length > 0) ? 100 : 0;

    return [
      {
        id: "basic",
        label: "Thông tin cơ bản",
        step: 1,
        progress: basicPercent,
      },
      {
        id: "quiz",
        label: "Ngân hàng câu hỏi",
        step: 2,
        progress: quizPercent,
      },
      {
        id: "curriculum",
        label: "Nội dung bài học",
        step: 3,
        progress: curriculumPercent,
      },
      {
        id: "settings",
        label: "Media & Định giá",
        step: 4,
        progress: settingsPercent,
      },
    ];
  }, [watchedValues]);

  const currentStepNum = steps.find((s) => s.id === activeTab)?.step || 1;

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto h-20">
      {steps.map((s, idx) => {
        const isActive = s.id === activeTab;
        const isCompleted = s.progress === 100;
        const isLast = idx === steps.length - 1;

        // SVG Circle properties
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        // Map 0-100 progress to stroke offset
        const offset = circumference - (s.progress / 100) * circumference;

        return (
          <React.Fragment key={s.id}>
            {/* Step Node with Circular Progress */}
            <div
              className="relative flex flex-col items-center justify-center group cursor-pointer"
              onClick={() => onTabChange(s.id)}
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform group-hover:scale-105 transition-transform duration-300">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-success transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Circle Content */}
                <div
                  className={`
                    w-[28px] h-[28px] rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300
                    ${isActive
                      ? "bg-success text-white shadow-lg shadow-success/20 scale-105"
                      : isCompleted
                        ? "bg-success text-white"
                        : "bg-white text-slate-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    s.step
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="absolute -bottom-6 whitespace-nowrap text-[11px] font-bold transition-all duration-300 text-center uppercase tracking-tighter">
                <p
                  className={`${isActive ? "text-success scale-110" : isCompleted ? "text-success" : "text-muted-foreground opacity-60"}`}
                >
                  {s.label}
                </p>
              </div>
            </div>

            {/* Connection Line Segment */}
            {!isLast && (
              <div className="flex-1 mx-2 h-[2px] bg-secondary relative rounded-full overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-success transition-all duration-1000 ease-out
                    ${currentStepNum > idx + 1 ? "w-full" : "w-0"}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function CheckIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function VideoProgressCircle({ progress, size = 60 }) {
  const radius = size * 0.4;
  const stroke = size * 0.10; // Tăng độ dày viền
  const normalizedRadius = radius - stroke * 1.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e2e8f0" // Track đậm hơn
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#16a34a" // Xanh lá đậm mượt

          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-success">{progress}%</span>
    </div>
  );
}

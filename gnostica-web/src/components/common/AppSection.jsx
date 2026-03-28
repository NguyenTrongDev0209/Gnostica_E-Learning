import React from 'react';
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const AppBreadcrumb = ({ 
  items, 
  className = "",
  linkClassName = "text-slate-500 hover:text-slate-900",
  activeClassName = "text-slate-800 font-semibold",
  separatorClassName = ""
}) => {
  return (
    <Breadcrumb className={cn("mb-6", className)}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className={cn(activeClassName)}>
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  asChild={!!item.component}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 font-medium transition-colors",
                    linkClassName,
                    item.className
                  )}
                >
                  {item.component ? (
                    item.component
                  ) : (
                    <>
                      {item.icon && <item.icon className="h-4 w-4 mb-[2px]" />}
                      {item.label}
                    </>
                  )}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator className={separatorClassName} />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

const SectionContainer = ({
  title,
  description,
  children,
  className = "",
  containerClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center",
  centered = false
}) => {
  return (
    <section className={cn("app-container", className)}>
      {title && (
        <div className={cn(
          "mb-6 md:mb-10 flex flex-col",
          centered ? "items-center text-center w-full" : "items-start text-left w-full"
        )}>
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-slate-900 font-sans w-full",
            centered ? "" : "border-b border-border pb-2"
          )}>
            {title}
          </h2>
          {description && (
            <p className={cn(
              "mt-2 text-neutral-500 text-sm md:text-base max-w-2xl w-full",
              centered ? "mx-auto" : ""
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn("w-full", containerClassName)}>
        {children}
      </div>
    </section>
  );
};

export const PageHeader = ({
  title,
  highlightedTitle,
  italic = true,
  description,
  className = "",
  centered = false
}) => {
  return (
    <div className={cn(
      "flex flex-col gap-2 sm:gap-4 mb-8 sm:mb-12",
      centered ? "items-center text-center" : "items-start text-left",
      className
    )}>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight font-sans">
        {title}{" "}
        {highlightedTitle && (
          <span className={cn("bg-button-gradient bg-clip-text text-transparent", italic && "italic")}>
            {highlightedTitle}.
          </span>
        )}
      </h1>
      {description && (
        <p className="text-slate-500 max-w-2xl text-sm sm:text-base leading-relaxed font-sans">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionContainer;

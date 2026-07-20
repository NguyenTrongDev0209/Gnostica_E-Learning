import React from "react";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export default function AppBreadcrumb({ paths = [], className = "mb-6" }) {
  const normalizedPaths = paths.filter((path, index) => {
    if (index !== 0) return true;
    return path.href !== "/" && path.label !== "Trang chủ";
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {normalizedPaths.map((path, index) => {
          const isLast = index === normalizedPaths.length - 1;

          return (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !path.href ? (
                  <BreadcrumbPage className="text-sm font-semibold text-foreground">{path.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
                      {path.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

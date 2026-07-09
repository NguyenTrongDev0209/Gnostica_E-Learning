import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const AuthCard = ({ children, title, description, maxWidth = "max-w-[480px]" }) => {
  return (
    <div className={`w-full ${maxWidth}`}>
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          {/* Heading */}
          {(title || description) && (
            <div className="text-center mb-6">
              {title && <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>}
              {description && (
                <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Form Content */}
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard;

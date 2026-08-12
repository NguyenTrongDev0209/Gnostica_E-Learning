import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { AppButton } from '@/components/common/micro/AppButton';

export default function MessagingErrorState({ title = 'Đã xảy ra lỗi', description = 'Không thể tải dữ liệu nhắn tin. Vui lòng thử lại.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">{description}</p>
      {onRetry && (
        <AppButton onClick={onRetry} variant="outline" className="btn-sm rounded-xl font-bold">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Thử lại
        </AppButton>
      )}
    </div>
  );
}

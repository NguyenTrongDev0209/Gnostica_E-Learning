import React from 'react';
import { Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';

export default function MessageDeliveryStatus({ status, onRetry, errorText }) {
  if (!status || status === 'sent') {
    return (
      <span className="inline-flex items-center text-[10px] text-primary/70 ml-1.5" title="Đã gửi">
        <Check className="w-3 h-3" />
      </span>
    );
  }

  if (status === 'sending') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground ml-1.5" title="Đang gửi...">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Đang gửi...</span>
      </span>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-error font-medium mt-1">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{errorText || 'Gửi thất bại'}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-error underline hover:text-error/80 ml-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Thử lại</span>
          </button>
        )}
      </div>
    );
  }

  return null;
}

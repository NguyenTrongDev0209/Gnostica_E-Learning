import React from 'react';
import { Save } from 'lucide-react';
import { SimpleButton } from '@/components/common/micro/AppButton';

export function SettingsHeader({ onSave, isSaving }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Cài Đặt Hệ Thống</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cấu hình và tùy chỉnh các thông số vận hành của nền tảng Gnostica.
        </p>
      </div>
      <SimpleButton 
        className="font-bold flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        onClick={onSave}
        disabled={isSaving}
      >
        <Save className="w-4 h-4" />
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </SimpleButton>
    </div>
  );
}

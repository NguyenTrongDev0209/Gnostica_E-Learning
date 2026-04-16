import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SettingsHeader({ onSave, isSaving }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài Đặt Hệ Thống</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cấu hình và tùy chỉnh các thông số vận hành của nền tảng Gnostica.
        </p>
      </div>
      <Button 
        onClick={onSave} 
        disabled={isSaving}
        className="font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
      >
        <Save className="w-4 h-4" />
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </div>
  );
}

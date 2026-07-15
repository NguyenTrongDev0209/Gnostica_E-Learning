import React from 'react';
import DataTable from "@/components/common/composite/DataTable";
import { Badge } from "@/components/ui/badge";
import { TableActionIconButton } from "@/components/common/micro/AppButton";
import { Trash2, Edit, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BankTable({ banks, isLoading, onEdit, onDelete, startIndex = 0 }) {
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <div className="px-4 pb-2">
        <DataTable
          columns={[
            {
              header: "STT",
              width: "60px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (_, index) => startIndex + index + 1,
            },
            {
              header: "Ngân hàng",
              width: "400px",
              className: "text-center",
              cellClassName: "text-left py-4",
              render: (bank) => (
                <div className="flex items-center gap-3">
                  {bank.logoUrl ? (
                    <img 
                      src={bank.logoUrl} 
                      alt={bank.shortName} 
                      className="w-28 h-16 object-contain rounded"
                    />
                  ) : (
                    <div className="w-28 h-16 rounded flex items-center justify-center bg-secondary">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground text-lg leading-tight">{bank.shortName}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold mt-1">ID: {bank.externalId}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Mã",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center",
              render: (bank) => (
                <code className="text-xs font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                  {bank.bankCode}
                </code>
              ),
            },
            {
              header: "BIN",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (bank) => bank.bin,
            },
            {
              header: "Trạng thái",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center",
              render: (bank) => (
                bank.status === 1 ? (
                  <Badge variant="success" className="bg-success/10 text-success text-success border-success/20">Hoạt động</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border">Tạm dừng</Badge>
                )
              ),
            },
            {
              header: "Thao tác",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center",
              render: (bank) => (
                <div className="flex items-center justify-center gap-1">
                  <TableActionIconButton
                    icon={Edit}
                    title="Sửa"
                    onClick={() => onEdit(bank)}
                  />
                  <TableActionIconButton
                    icon={Trash2}
                    colorVariant="error"
                    title="Xóa"
                    onClick={() => onDelete(bank.id)}
                  />
                </div>
              ),
            },
          ]}
          data={banks}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <Building2 className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy ngân hàng nào.</p>
            </div>
          }
        />
      </div>
    </Card>
  );
}

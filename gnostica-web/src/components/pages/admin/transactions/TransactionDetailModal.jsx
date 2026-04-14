import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, DollarSign, Info, User, Building2 } from "lucide-react";
import { format } from "date-fns";

export function TransactionDetailModal({ isOpen, onOpenChange, transaction }) {
  if (!transaction) return null;

  const logs = transaction.log ? JSON.parse(transaction.log) : null;

  const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{value || 'N/A'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-4">
            Chi tiết Giao dịch
            <span className="text-xs font-mono text-slate-400">#{transaction.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <DetailItem icon={Info} label="Mã giao dịch" value={transaction.transactionCode} className="col-span-2" />
          
          <DetailItem icon={DollarSign} label="Số tiền" value={`${transaction.amount?.toLocaleString()}đ`} />
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              Trạng thái
            </span>
            <div>
              {transaction.status === 1 ? (
                <Badge className="bg-green-100 text-green-600 border-green-200">Thành công</Badge>
              ) : (
                <Badge variant="secondary">Chờ xử lý / Thất bại</Badge>
              )}
            </div>
          </div>

          <DetailItem icon={CreditCard} label="Phương thức" value={transaction.paymentMethod} />
          <DetailItem icon={Calendar} label="Thời gian" value={transaction.createdAt ? format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm:ss") : 'N/A'} />
          
          <div className="col-span-2 h-px bg-slate-100 my-2"></div>

          <DetailItem icon={Building2} label="Ngân hàng người gửi" value={transaction.senderBankId} />
          <DetailItem icon={User} label="Số tài khoản người gửi" value={transaction.senderAccountNumber} />
          <DetailItem icon={Info} label="Nội dung/Tham chiếu" value={transaction.ref} className="col-span-2" />

          {logs && (
            <div className="col-span-2 space-y-2 mt-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                Dữ liệu Log (JSON Metadata)
              </span>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-[11px] text-green-400 font-mono leading-relaxed">
                  {JSON.stringify(logs, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

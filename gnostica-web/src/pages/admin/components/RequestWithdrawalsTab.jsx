import React, { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/payment/useTransactions";
import {
  Wallet,
  Clock,
  CheckCheck,
  XCircle,
  Search,
  Filter,
  Eye,
  Info,
  DollarSign,
  Calendar,
  X,
  CreditCard,
  Building2,
  User,
  RotateCcw,
  PieChart,
  LayoutList
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import {
  AppDialogRoot as Dialog,
  AppDialogContent as DialogContent,
  AppDialogHeader as DialogHeader,
  AppDialogTitle as DialogTitle,
} from "@/components/common/micro/AppDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";
import useRequestStats from "@/hooks/admin/useRequestStats";
import { RequestTrendChart, RequestStatusDonut } from "@/components/common/composite/RequestStatCharts";
import { RefreshCw } from "lucide-react";

export default function RequestWithdrawalsTab() {
  const { transactions, isLoading } = useTransactions("withdrawals");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState("STATISTICS");

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { stats: apiStats, loading: statsLoading, months, changeMonths } = useRequestStats('withdrawals');

  const stats = useMemo(() => {
    const total = transactions.length;
    const open = transactions.filter((t) => t.status === 1).length;
    const resolved = transactions.filter((t) => t.status === 2).length;
    const rejected = transactions.filter((t) => t.status === 3).length;
    return { total, open, resolved, rejected };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter.length > 0 && !statusFilter.includes(String(t.status))) {
        return false;
      }
      const createdAt = t.createdAt ? new Date(t.createdAt) : null;
      if (dateRange.from && createdAt && createdAt < new Date(dateRange.from)) return false;
      if (dateRange.to && createdAt && createdAt > new Date(new Date(dateRange.to).setHours(23, 59, 59))) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const studentName = t.performerName?.toLowerCase() || "";
        const studentEmail = t.performerEmail?.toLowerCase() || "";
        const ref = t.ref?.toLowerCase() || "";
        const orderCode = t.transactionCode?.toLowerCase() || "";
        const bank = t.senderBankId?.toLowerCase() || "";
        const accNo = t.senderAccountNumber?.toLowerCase() || "";

        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          ref.includes(query) ||
          orderCode.includes(query) ||
          bank.includes(query) ||
          accNo.includes(query)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions, statusFilter, searchQuery, dateRange]);

  const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const getStatusBadge = (status, label) => {
    switch (status) {
      case 2: return <AppBadge variant="success" className="px-2.5 py-1">{label || "Thành công"}</AppBadge>;
      case 1: return <AppBadge variant="warning" className="px-2.5 py-1 text-warning bg-warning/10">{label || "Chờ xử lý"}</AppBadge>;
      case 3: return <AppBadge variant="error" className="px-2.5 py-1">{label || "Thất bại"}</AppBadge>;
      default: return <AppBadge variant="outline" className="px-2.5 py-1">{label || "Không rõ"}</AppBadge>;
    }
  };

  const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filter and Search toolbar */}
      <DataFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm theo tên, email, mã GD, ngân hàng..."
        dropdownChecklists={[
          {
            title: "Trạng thái",
            items: [
              { label: "Chờ xử lý", value: "1" },
              { label: "Thành công", value: "2" },
              { label: "Thất bại", value: "3" },
            ],
            selectedItems: statusFilter,
            onItemToggle: (val) => setStatusFilter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]),
            onClear: () => setStatusFilter([]),
          },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateRangePlaceholder="Ngày yêu cầu"
      />

      {/* Data Table */}
      <DataTable
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredTransactions.length,
          onPageChange: () => {},
          zeroIndexed: false,
          pageSize: filteredTransactions.length || 10,
        }}
        columns={[
          {
            header: "Mã GD",
            width: "120px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => <span className="text-xs font-bold text-muted-foreground">{t.transactionCode}</span>,
          },
          {
            header: "Giảng viên",
            width: "220px",
            align: "left",
            headerAlign: "left",
            render: (t) => (
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 border border-border shrink-0">
                  <AvatarImage src={t.performerAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {t.performerName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate" title={t.performerName}>
                    {t.performerName || "Ẩn danh"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={t.performerEmail}>
                    {t.performerEmail || "Chưa có email"}
                  </p>
                </div>
              </div>
            ),
          },
          {
            header: "Số tiền",
            width: "140px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => <span className="font-bold text-foreground">{formatCurrency(t.amount)}</span>,
          },
          {
            header: "Ngân hàng nhận",
            width: "180px",
            align: "left",
            headerAlign: "left",
            render: (t) => (
              <div className="flex flex-col text-sm">
                <span className="font-medium text-foreground">{t.senderBankId || "N/A"}</span>
                <span className="text-xs text-muted-foreground">{t.senderAccountNumber || "N/A"}</span>
              </div>
            ),
          },
          {
            header: "Trạng thái",
            width: "120px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => getStatusBadge(t.status, t.statusLabel),
          },
          {
            header: "Ngày yêu cầu",
            width: "140px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => (
              <span className="text-xs text-muted-foreground">
                {t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN") : "—"}
              </span>
            ),
          },
          {
            header: "Thao tác",
            width: "80px",
            align: "center",
            headerAlign: "center",
            className: "text-center",
            render: (t) => (
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedTransaction(t);
                    setIsDetailModalOpen(true);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-border bg-white"
                  title="Xem chi tiết"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={filteredTransactions}
        isLoading={isLoading}
        loadingState="Đang tải danh sách rút tiền..."
        emptyState="Không có yêu cầu rút tiền nào phù hợp."
      />

      {/* Ticket Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px] z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-4">
              Chi tiết Rút Tiền
              <span className="text-xs font-mono text-muted-foreground">#{selectedTransaction?.id}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <DetailItem icon={Info} label="Mã giao dịch" value={selectedTransaction.transactionCode} className="col-span-2" />

              <DetailItem icon={User} label="Người thực hiện" value={selectedTransaction.performerName} />
              <DetailItem icon={Info} label="Email" value={selectedTransaction.performerEmail} />
              
              <DetailItem icon={DollarSign} label="Số tiền" value={formatCurrency(selectedTransaction.amount)} />
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                  Trạng thái
                </span>
                <div>
                  {getStatusBadge(selectedTransaction.status, selectedTransaction.statusLabel)}
                </div>
              </div>

              <DetailItem icon={CreditCard} label="Phương thức" value={selectedTransaction.paymentMethod} />
              <DetailItem icon={Calendar} label="Thời gian" value={selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString("vi-VN") : "N/A"} />
              
              <div className="col-span-2 h-px bg-secondary my-2"></div>

              <DetailItem
                icon={Building2}
                label="Ngân hàng nhận"
                value={selectedTransaction.senderBankId}
              />
              <DetailItem
                icon={User}
                label="Số tài khoản nhận"
                value={selectedTransaction.senderAccountNumber}
              />
              <DetailItem icon={Info} label="Nội dung/Tham chiếu" value={selectedTransaction.ref} className="col-span-2" />

              {selectedTransaction.log && (
                <div className="col-span-2 space-y-2 mt-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    Dữ liệu Log (JSON Metadata)
                  </span>
                  <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <pre className="text-[11px] text-success font-mono leading-relaxed">
                      {typeof selectedTransaction.log === "string" ? selectedTransaction.log : JSON.stringify(selectedTransaction.log, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

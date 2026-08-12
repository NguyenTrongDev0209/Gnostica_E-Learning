import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import useWithdrawalRequests from "@/hooks/payment/useWithdrawalRequests";
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
import { AppButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import {
  AppDialogRoot as Dialog,
  AppDialogContent as DialogContent,
  AppDialogHeader as DialogHeader,
  AppDialogTitle as DialogTitle,
} from "@/components/common/micro/AppDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";

export default function WithdrawalModerationList() {
  const { withdrawals, loading, fetchWithdrawals, pagination, approveWithdrawal, rejectWithdrawal, actionLoading } = useWithdrawalRequests(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handlePageChange = (newPage) => {
    fetchWithdrawals(newPage, pagination.size, statusFilter);
  };

  const handleStatusFilterChange = (newStatuses) => {
    setStatusFilter(newStatuses);
    fetchWithdrawals(0, pagination.size, newStatuses);
  };

  const filteredTransactions = useMemo(() => {
    return withdrawals.filter((t) => {
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
    });
  }, [withdrawals, searchQuery, dateRange]);

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

  const closeDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
    setRejectMode(false);
    setRejectReason("");
  };

  const handleApprove = async () => {
    if (!selectedTransaction) return;
    await approveWithdrawal(selectedTransaction.id);
    closeDetail();
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    await rejectWithdrawal(selectedTransaction.id, rejectReason);
    closeDetail();
  };

  let logs = selectedTransaction?.log || null;
  if (typeof logs === "string") {
    try {
      logs = JSON.parse(logs);
    } catch {
      logs = { raw: logs };
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
            selectedItems: statusFilter || [],
            onItemToggle: (val) => {
              const newStatuses = (statusFilter || []).includes(val)
                ? (statusFilter || []).filter((v) => v !== val)
                : [...(statusFilter || []), val];
              handleStatusFilterChange(newStatuses);
            },
            onClear: () => handleStatusFilterChange([]),
          },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateRangePlaceholder="Ngày yêu cầu"
      />

      <DataTable
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalElements,
          onPageChange: handlePageChange,
          zeroIndexed: true,
          pageSize: pagination.size,
        }}
        columns={[
          {
            header: "STT",
            sortable: false,
            width: "60px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "text-sm font-bold text-foreground py-4 text-center whitespace-nowrap",
            render: (_t, rowIndex) => (pagination.page * pagination.size) + rowIndex + 1,
          },
          {
            header: "Mã GD",
            width: "120px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center py-4",
            render: (t) => <span className="text-sm font-bold text-muted-foreground">{t.transactionCode}</span>,
          },
          {
            header: "Giảng viên",
            width: "220px",
            align: "left",
            headerAlign: "left",
            cellClassName: "py-4",
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
            cellClassName: "text-center py-4",
            render: (t) => <span className="font-bold text-foreground">{formatCurrency(t.amount)}</span>,
          },
          {
            header: "Ngân hàng nhận",
            width: "180px",
            align: "left",
            headerAlign: "left",
            cellClassName: "py-4",
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
            cellClassName: "text-center py-4",
            render: (t) => getStatusBadge(t.status, t.statusLabel),
          },
          {
            header: "Ngày yêu cầu",
            width: "140px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center py-4",
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
            cellClassName: "py-4 text-center",
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
        isLoading={loading}
        loadingState="Đang tải danh sách rút tiền..."
        emptyState="Không có yêu cầu rút tiền nào phù hợp."
      />

      <Dialog open={isDetailModalOpen} onOpenChange={(val) => !val && closeDetail()}>
        <DialogContent className="sm:max-w-[600px] z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-4">
              Chi tiết Rút Tiền
              <span className="text-xs font-mono text-muted-foreground">#{selectedTransaction?.id}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="grid grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
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

              {/* Parsed Metadata fields */}
              {(logs?.rejectionReason || logs?.approvedBy || logs?.approvedAt) && (
                 <div className="col-span-2 border-t pt-4 grid grid-cols-2 gap-4">
                    {logs?.rejectionReason && (
                      <DetailItem icon={Info} label="Lý do từ chối" value={logs.rejectionReason} className="col-span-2 text-error" />
                    )}
                    {logs?.approvedBy && (
                      <DetailItem icon={User} label="Người duyệt" value={logs.approvedBy} />
                    )}
                    {logs?.approvedAt && (
                      <DetailItem icon={Calendar} label="Thời gian duyệt" value={new Date(logs.approvedAt).toLocaleString("vi-VN")} />
                    )}
                 </div>
              )}

              {logs && (
                <div className="col-span-2 space-y-2 mt-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                    Dữ liệu Log (JSON Metadata)
                  </span>
                  <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <pre className="text-[11px] text-success font-mono leading-relaxed">
                      {JSON.stringify(logs, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTransaction?.requiresManualApproval && (
            <div className="border-t pt-4">
              {!rejectMode ? (
                <div className="flex items-center justify-end gap-3">
                  <AppButton
                    appVariant="ghostMuted"
                    variant="default"
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="bg-success text-white hover:bg-success/90 font-bold border-none"
                  >
                    <CheckCheck className="w-4 h-4" /> {actionLoading ? "Đang xử lý..." : "Duyệt & chuyển khoản"}
                  </AppButton>
                  <AppButton
                    appVariant="ghostMuted"
                    variant="default"
                    type="button"
                    onClick={() => setRejectMode(true)}
                    disabled={actionLoading}
                    className="bg-error text-white hover:bg-error/90 font-bold border-none"
                  >
                    <XCircle className="w-4 h-4" /> Từ chối
                  </AppButton>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-muted-foreground">
                    Lý do từ chối (hiển thị cho giảng viên)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do từ chối lệnh rút tiền..."
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <AppButton
                      appVariant="ghostMuted"
                      variant="default"
                      type="button"
                      onClick={() => { setRejectMode(false); setRejectReason(""); }}
                      disabled={actionLoading}
                      className="border border-border text-foreground font-bold"
                    >
                      Quay lại
                    </AppButton>
                    <AppButton
                      appVariant="ghostMuted"
                      variant="default"
                      type="button"
                      onClick={handleReject}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="bg-error text-white hover:bg-error/90 font-bold border-none"
                    >
                      {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </AppButton>
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

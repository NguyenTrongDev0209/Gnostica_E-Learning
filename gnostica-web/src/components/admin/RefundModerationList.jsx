import React, { useState, useMemo } from "react";
import useRefundRequests from "@/hooks/payment/useRefundRequests";
import {
  Undo2,
  Clock,
  CheckCheck,
  XCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  User,
  Mail,
  Info,
  DollarSign,
  Calendar,
  X,
  CreditCard,
  PieChart,
  LayoutList,
  BookOpen
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";
import RefundRejectModal from "@/components/modals/RefundRejectModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";

export default function RefundModerationList() {
  const { refunds, loading, approveRefund, rejectRefund, fetchRefunds, pagination } = useRefundRequests(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const [selectedRefundAction, setSelectedRefundAction] = useState(null);
  const [isApproveAlertOpen, setIsApproveAlertOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Trigger search / filter (Server-side)
  // For search and date range, currently not implemented in backend (the backend only takes status, page, size)
  // So we will do client-side filtering for search & dateRange, but server-side for pagination & status.
  // Wait, if pagination is server-side, client-side filtering will only filter the current page!
  // The plan didn't specify adding search/date filtering to backend, so we will pass status to backend and do client search on the returned page for now, or just pass status.
  // Actually, we should trigger fetchRefunds when page or status changes.
  
  const handlePageChange = (newPage) => {
    fetchRefunds(newPage, pagination.size, statusFilter);
  };

  const handleStatusFilterChange = (newStatuses) => {
    setStatusFilter(newStatuses);
    fetchRefunds(0, pagination.size, newStatuses);
  };

  const handleApproveRefund = async () => {
    if (selectedRefundAction?.tx) {
      await approveRefund(selectedRefundAction.tx.id);
      setIsApproveAlertOpen(false);
      setSelectedRefundAction(null);
    }
  };

  const handleRejectRefund = async () => {
    if (selectedRefundAction?.tx) {
      await rejectRefund(selectedRefundAction.tx.id, rejectReason);
      setIsRejectModalOpen(false);
      setSelectedRefundAction(null);
      setRejectReason("");
    }
  };

  const filteredRefunds = useMemo(() => {
    return refunds.filter((t) => {
      const createdAt = t.createdAt ? new Date(t.createdAt) : null;
      if (dateRange.from && createdAt && createdAt < new Date(dateRange.from)) return false;
      if (dateRange.to && createdAt && createdAt > new Date(new Date(dateRange.to).setHours(23, 59, 59))) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const studentName = t.performerName?.toLowerCase() || "";
        const studentEmail = t.performerEmail?.toLowerCase() || "";
        const ref = t.ref?.toLowerCase() || "";
        const orderCode = t.transactionCode?.toLowerCase() || "";
        const course = t.courseTitle?.toLowerCase() || "";

        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          ref.includes(query) ||
          orderCode.includes(query) ||
          course.includes(query)
        );
      }
      return true;
    });
  }, [refunds, searchQuery, dateRange]);

  const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const formatReason = (reason) => {
    if (!reason) return "Không có lý do.";
    if (reason.startsWith("REFUND_GIFT_")) {
      return "Hoàn tiền thẻ quà tặng";
    }
    return reason;
  };

  const getStatusBadge = (status, label) => {
    // Lưu ý: AdminTransactionResponse.refundStatus map raw RefundStatus sang PaymentStatus
    // (1=PENDING, 2→4=REFUNDED, 3=FAILED) nên trạng thái "Đã hoàn tiền" có status = 4.
    switch (status) {
      case 2:
      case 4: return <AppBadge variant="success" className="w-[100px] justify-center px-2.5 py-1 text-white">{label || "Đã duyệt"}</AppBadge>;
      case 1: return <AppBadge variant="warning" className="w-[100px] justify-center px-2.5 py-1 text-white">{label || "Đang chờ"}</AppBadge>;
      case 3: return <AppBadge variant="error" className="w-[100px] justify-center px-2.5 py-1 text-white">{label || "Bị từ chối"}</AppBadge>;
      default: return <AppBadge variant="outline" className="w-[100px] justify-center px-2.5 py-1">{label || "Không rõ"}</AppBadge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <DataFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm theo tên, email, khóa học, mã đơn hàng..."
        dropdownChecklists={[
          {
            title: "Trạng thái",
            items: [
              { label: "Chờ duyệt", value: "1" },
              { label: "Đã duyệt", value: "2" },
              { label: "Bị từ chối", value: "3" },
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
            width: "70px",
            align: "center",
            headerAlign: "center",
            className: "py-4 pl-4 whitespace-nowrap",
            cellClassName: "font-bold text-muted-foreground py-4 text-center pl-4 whitespace-nowrap",
            render: (_t, rowIndex) => ((pagination?.page || 0) * (pagination?.size || 10)) + rowIndex + 1,
          },
          {
            header: "Mã hoàn tiền",
            width: "140px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "text-sm font-medium py-4 text-center whitespace-nowrap",
            render: (t) => t.refundCode ? <span className="text-foreground text-center">HT{t.refundCode}</span> : <span className="text-muted-foreground italic text-xs">(N/A)</span>,
          },
          {
            header: "Mã đơn hàng",
            width: "120px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "text-sm font-medium py-4 text-center whitespace-nowrap",
            render: (t) => t.transactionCode ? <span className="text-foreground text-center">TT{t.transactionCode}</span> : <span className="text-muted-foreground italic text-xs">(N/A)</span>,
          },
          {
            header: "Học viên",
            width: "180px",
            align: "left",
            headerAlign: "left",
            className: "py-4",
            cellClassName: "py-4",
            render: (t) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={t.performerAvatar} alt={t.performerName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {t.performerName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground text-sm truncate" title={t.performerName}>
                    {t.performerName || "Ẩn danh"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate" title={t.performerEmail}>
                    {t.performerEmail || "Chưa có email"}
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: "Khóa học",
            width: "150px",
            align: "left",
            headerAlign: "left",
            className: "py-4",
            cellClassName: "py-4 text-sm font-medium",
            render: (t) => (
              <div className="w-[150px] truncate" title={t.courseTitle}>{t.courseTitle || "N/A"}</div>
            ),
          },
          {
            header: "Số tiền",
            width: "120px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
            render: (t) => formatCurrency(t.amount),
          },
          {
            header: "Lý do",
            width: "160px",
            align: "left",
            headerAlign: "left",
            className: "py-4",
            cellClassName: "py-4",
            render: (t) => (
              <span className="text-sm text-muted-foreground line-clamp-2" title={t.ref}>
                {formatReason(t.ref)}
              </span>
            ),
          },
          {
            header: "Trạng thái",
            width: "120px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "py-4 whitespace-nowrap",
            render: (t) => (
              <div className="flex justify-center w-full">
                {getStatusBadge(t.status, t.statusLabel)}
              </div>
            ),
          },
          {
            header: "Ngày yêu cầu",
            width: "120px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "text-sm text-foreground font-medium py-4 text-center whitespace-nowrap",
            render: (t) => {
               if (!t.createdAt) return <span className="text-muted-foreground italic text-xs">(Không rõ)</span>;
               const d = new Date(t.createdAt);
               const time = d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
               const date = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
               return `${time} ${date}`;
            },
          },
          {
            header: "Thao tác",
            sortable: false,
            width: "100px",
            align: "center",
            headerAlign: "center",
            className: "py-4 whitespace-nowrap",
            cellClassName: "py-4 text-center whitespace-nowrap",
            render: (t) => (
              <div className="flex justify-center items-center gap-1.5 flex-wrap">
                <AppButton
                  size="sm"
                  className="w-8 h-8 p-0 bg-info hover:bg-info/90 text-white border-none shrink-0"
                  title="Xem chi tiết"
                  onClick={() => {
                    setSelectedTransaction(t);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </AppButton>
                {t.status === 1 && (
                  <>
                    <AppButton
                      size="sm"
                      className="w-8 h-8 p-0 bg-success hover:bg-success/90 text-white border-none shrink-0"
                      title="Duyệt"
                      onClick={() => {
                        setSelectedRefundAction({ type: 'approve', tx: t });
                        setIsApproveAlertOpen(true);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </AppButton>
                    <AppButton
                      size="sm"
                      className="w-8 h-8 p-0 bg-error hover:bg-error/90 text-white border-none shrink-0"
                      title="Từ chối"
                      onClick={() => {
                        setSelectedRefundAction({ type: 'reject', tx: t });
                        setIsRejectModalOpen(true);
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </AppButton>
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={filteredRefunds}
        isLoading={loading}
        loadingState="Đang tải danh sách hoàn tiền..."
        emptyState="Không có yêu cầu hoàn tiền nào phù hợp."
      />
      <AppAlertDialog
        open={isApproveAlertOpen}
        onOpenChange={setIsApproveAlertOpen}
        onConfirm={handleApproveRefund}
        title="Duyệt hoàn tiền"
        description={`Bạn có chắc chắn muốn duyệt yêu cầu hoàn tiền cho đơn hàng ${selectedRefundAction?.tx?.transactionCode}? Hành động này sẽ cập nhật số dư ví giảng viên và thu hồi khóa học của học viên.`}
        confirmText="Duyệt"
        variant="success"
        cancelText="Hủy"
      />

      <RefundRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        targetInfo={selectedRefundAction?.tx?.transactionCode}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onConfirm={handleRejectRefund}
      />

      {isDetailModalOpen && selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-lg">
                  Đơn {selectedTransaction.transactionCode}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Chi Tiết Hoàn Tiền</h3>
                  <p className="text-xs text-muted-foreground">
                    Yêu cầu lúc {selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString("vi-VN") : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> Người yêu cầu:
                  </span>
                  <p className="text-sm font-bold text-foreground">{selectedTransaction.performerName || "Ẩn danh"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedTransaction.performerEmail || "Chưa có email"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-primary" /> Số tiền:
                  </span>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> Khóa học:
                  </span>
                  <p className="text-sm font-medium text-foreground">{selectedTransaction.courseTitle || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Thời điểm mua:
                  </span>
                  <p className="text-sm font-medium text-foreground">{selectedTransaction.paidAt ? new Date(selectedTransaction.paidAt).toLocaleString("vi-VN") : "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Số ngày sau mua:
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTransaction.daysSincePaid != null ? `${selectedTransaction.daysSincePaid} ngày` : "N/A"}
                    {selectedTransaction.daysSincePaid != null && selectedTransaction.daysSincePaid <= 14 && (
                      <AppBadge variant="success" className="ml-2 py-0 px-1 text-[10px]">Hợp lệ (≤ 14)</AppBadge>
                    )}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-primary" /> Tiến độ học tập:
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTransaction.progressPercent != null ? `${selectedTransaction.progressPercent}%` : "N/A"}
                    {selectedTransaction.progressPercent != null && selectedTransaction.progressPercent < 20 && (
                      <AppBadge variant="success" className="ml-2 py-0 px-1 text-[10px]">Hợp lệ (&lt; 20%)</AppBadge>
                    )}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-border/50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Trạng thái hiện tại:
                    </span>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status, selectedTransaction.statusLabel)}</div>
                  </div>
                  
                  {selectedTransaction.decisionType && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-muted-foreground mb-1">
                        Loại quyết định:
                      </span>
                      <AppBadge variant={selectedTransaction.decisionType.includes('AUTO') ? 'secondary' : 'outline'} className="text-[11px]">
                        {selectedTransaction.decisionType.replace('_', ' ')}
                      </AppBadge>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Lý do hoàn tiền</h4>
                <div className="text-sm text-foreground bg-muted/20 p-4 rounded-xl border border-border whitespace-pre-wrap leading-relaxed min-h-[80px]">
                  {selectedTransaction.ref || "Không có lý do."}
                </div>
              </div>
            </div>

            {selectedTransaction.status === 1 && (
              <div className="p-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-end gap-2">
                <AppButton
                  appVariant="ghostMuted" variant="ghost" size="sm"
                  className="gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                  onClick={() => {
                    setSelectedRefundAction({ type: 'approve', tx: selectedTransaction });
                    setIsApproveAlertOpen(true);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Duyệt
                </AppButton>
                <AppButton
                  appVariant="ghostMuted" variant="ghost" size="sm"
                  className="gap-1 text-error border border-error/20 bg-white hover:bg-error/10"
                  onClick={() => {
                    setSelectedRefundAction({ type: 'reject', tx: selectedTransaction });
                    setIsRejectModalOpen(true);
                  }}
                >
                  <XCircle className="w-4 h-4" /> Từ chối
                </AppButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

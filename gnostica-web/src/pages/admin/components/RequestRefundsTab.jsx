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
  LayoutList
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";
import RefundRejectModal from "@/components/modals/RefundRejectModal";
import useRequestStats from "@/hooks/admin/useRequestStats";
import { RequestTrendChart, RequestStatusDonut } from "@/components/common/composite/RequestStatCharts";
import { RefreshCw } from "lucide-react";

export default function RequestRefundsTab() {
  const { refunds, loading, approveRefund, rejectRefund, refetch } = useRefundRequests(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState("STATISTICS");

  const { stats: apiStats, loading: statsLoading, changeMonths } = useRequestStats('refunds');

  const [selectedRefundAction, setSelectedRefundAction] = useState(null); // { type: 'approve' | 'reject', tx: any }
  const [isApproveAlertOpen, setIsApproveAlertOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const stats = useMemo(() => {
    const total = refunds.length;
    const open = refunds.filter((t) => t.status === 1).length;
    const resolved = refunds.filter((t) => t.status === 2).length;
    const rejected = refunds.filter((t) => t.status === 3).length;
    return { total, open, resolved, rejected };
  }, [refunds]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((t) => {
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

        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          ref.includes(query) ||
          orderCode.includes(query)
        );
      }
      return true;
    });
  }, [refunds, statusFilter, searchQuery, dateRange]);

  const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const getStatusBadge = (status, label) => {
    switch (status) {
      case 2: return <AppBadge variant="success" className="px-2.5 py-1">{label || "Đã duyệt"}</AppBadge>;
      case 1: return <AppBadge variant="warning" className="px-2.5 py-1 text-warning bg-warning/10">{label || "Đang chờ"}</AppBadge>;
      case 3: return <AppBadge variant="error" className="px-2.5 py-1">{label || "Bị từ chối"}</AppBadge>;
      default: return <AppBadge variant="outline" className="px-2.5 py-1">{label || "Không rõ"}</AppBadge>;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="STATISTICS"><div className="flex items-center gap-2"><PieChart className="w-4 h-4" /> Thống kê</div></TabsTrigger>
          <TabsTrigger value="LIST"><div className="flex items-center gap-2"><LayoutList className="w-4 h-4" /> Danh sách</div></TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="STATISTICS" className="mt-0 space-y-6">
        {statsLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground"><RefreshCw className="animate-spin w-5 h-5 mr-2" /> Đang tải dữ liệu thống kê...</div>
        ) : (
          <>
            <RequestTrendChart 
                data={apiStats?.trends} 
                title="Xu hướng Hoàn tiền" 
                hasAmount={true}
                onMonthsChange={changeMonths}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RequestStatusDonut 
                    data={apiStats?.statusDistribution} 
                    title="Tỉ lệ trạng thái xử lý"
                />
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="LIST" className="mt-0 space-y-6">
      {/* Filter and Search toolbar */}
      <DataFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm theo tên, email, mã đơn hàng, lý do..."
        dropdownChecklists={[
          {
            title: "Trạng thái",
            items: [
              { label: "Chờ duyệt", value: "1" },
              { label: "Đã duyệt", value: "2" },
              { label: "Bị từ chối", value: "3" },
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
          totalItems: filteredRefunds.length,
          onPageChange: () => {},
          zeroIndexed: false,
          pageSize: filteredRefunds.length || 10,
        }}
        columns={[
          {
            header: "Mã ĐH",
            width: "100px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => <span className="text-xs font-bold text-muted-foreground">{t.transactionCode}</span>,
          },
          {
            header: "Học viên",
            width: "180px",
            align: "left",
            headerAlign: "left",
            render: (t) => (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {t.performerName?.charAt(0) || "U"}
                </div>
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
            width: "120px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => <span className="font-bold text-foreground">{formatCurrency(t.amount)}</span>,
          },
          {
            header: "Lý do",
            width: "200px",
            align: "left",
            headerAlign: "left",
            render: (t) => (
              <span className="text-sm text-muted-foreground line-clamp-2" title={t.ref}>
                {t.ref}
              </span>
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
            width: "110px",
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
            width: "180px",
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
                {t.status === 1 && (
                  <>
                    <AppButton
                      appVariant="ghostMuted"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                      onClick={() => {
                        setSelectedRefundAction({ type: 'approve', tx: t });
                        setIsApproveAlertOpen(true);
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Duyệt
                    </AppButton>
                    <AppButton
                      appVariant="ghostMuted"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-error border border-error/20 bg-white hover:bg-error/10"
                      onClick={() => {
                        setSelectedRefundAction({ type: 'reject', tx: t });
                        setIsRejectModalOpen(true);
                      }}
                    >
                      <XCircle className="w-3 h-3" /> Từ chối
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
      </TabsContent>

      <AppAlertDialog
        isOpen={isApproveAlertOpen}
        onClose={() => setIsApproveAlertOpen(false)}
        onConfirm={handleApproveRefund}
        title="Duyệt hoàn tiền"
        description={`Bạn có chắc chắn muốn duyệt yêu cầu hoàn tiền cho đơn hàng ${selectedRefundAction?.tx?.transactionCode}? Hành động này sẽ cập nhật số dư ví giảng viên và thu hồi khóa học của học viên.`}
        confirmText="Duyệt"
        confirmVariant="success"
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

      {/* Ticket Detail Modal - Reused from Incidents Tab logic conceptually */}
      {isDetailModalOpen && selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Trạng thái hiện tại:
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status, selectedTransaction.statusLabel)}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Lý do hoàn tiền</h4>
                <div className="text-sm text-foreground bg-muted/20 p-4 rounded-xl border border-border whitespace-pre-wrap leading-relaxed min-h-[80px]">
                  {selectedTransaction.ref || "Không có lý do."}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
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
    </Tabs>
  );
}

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  TrendingUp,
  Wallet as WalletIcon,
  Calendar,
  DollarSign,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { useInstructorRevenue } from "@/hooks/payment/useInstructorRevenue";
import useAuthStore from "@/store/useAuthStore";
import WithdrawModal from "@/components/common/composite/WithdrawModal";

const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

function InstructorRevenueTable({
    transactions,
    pagination = { currentPage: 0, totalPages: 1, totalElements: 0, size: 10 },
    onPageChange,
}) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (_, index) => (
                <span className="text-sm font-bold text-muted-foreground tracking-tighter">
                    {(pagination.currentPage * (pagination.size || 10) + index + 1).toString().padStart(2, '0')}
                </span>
            )
        },
        {
            header: "Mã GD & Thời gian",
            render: (trx) => {
                const isIncome = trx.category === "EARNING" || trx.category === "DEPOSIT";
                const displayCode = trx.reference || (trx.id ? trx.id.toString().slice(0, 8) : "N/A");
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                            {displayCode}
                            {isIncome ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                            ) : (
                                <ArrowDownRight className="w-3.5 h-3.5 text-error" />
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mt-0.5">
                            {trx.createdAt ? new Date(trx.createdAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }) : "N/A"}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Nội dung",
            className: "max-w-[320px]",
            cellClassName: "max-w-[320px]",
            render: (trx) => {
                let desc = "Giao dịch ví";
                if (trx.category === "EARNING") {
                    desc = trx.reference ? `Thu nhập từ đơn hàng ${trx.reference}` : "Thu nhập bán khóa học";
                } else if (trx.category === "WITHDRAWAL") {
                    desc = trx.bankName ? `Rút tiền về ${trx.bankName} (${trx.maskedAccountNumber || ''})` : "Yêu cầu rút tiền về ngân hàng";
                } else if (trx.category === "REFUND") {
                    desc = trx.reference ? `Hoàn tiền học viên (${trx.reference})` : "Hoàn tiền khóa học cho học viên";
                } else if (trx.category === "DEPOSIT") {
                    desc = "Nạp tiền vào ví";
                } else if (trx.category === "GIFT_REFUND") {
                    desc = "Hoàn tiền tặng quà";
                }
                return (
                    <span className="text-sm font-semibold text-foreground line-clamp-1">
                        {desc}
                    </span>
                );
            }
        },
        {
            header: "Phát sinh",
            className: "text-right",
            cellClassName: "text-right",
            render: (trx) => {
                const isIncome = trx.category === "EARNING" || trx.category === "DEPOSIT";
                return (
                    <span className={`font-bold text-sm ${isIncome ? 'text-success' : 'text-error'}`}>
                        {isIncome ? `+${formatVND(trx.amount)}` : `-${formatVND(trx.amount)}`}
                    </span>
                );
            }
        },
        {
            header: "Loại",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => {
                const map = {
                    EARNING: { label: "Thu nhập", variant: "success" },
                    WITHDRAWAL: { label: "Rút tiền", variant: "secondary" },
                    REFUND: { label: "Hoàn tiền", variant: "error" },
                    DEPOSIT: { label: "Nạp tiền", variant: "info" },
                    GIFT_REFUND: { label: "Hoàn quà", variant: "warning" }
                };
                const conf = map[trx.category] || { label: trx.category || "Khác", variant: "outline" };
                return (
                    <AppBadge variant={conf.variant} soft className="text-[10px] font-bold uppercase tracking-tight py-0">
                        {conf.label}
                    </AppBadge>
                );
            }
        },
        {
            header: "Trạng thái",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => {
                const status = typeof trx.status === 'string' ? trx.status.toUpperCase() : String(trx.status);
                if (status === "COMPLETED" || status === "3") return (
                    <AppBadge variant="success" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                    </AppBadge>
                );
                if (status === "PENDING" || status === "1") return (
                    <AppBadge variant="warning" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Chờ duyệt
                    </AppBadge>
                );
                if (status === "AWAITING_APPROVAL" || status === "6") return (
                    <AppBadge variant="warning" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Chờ admin duyệt
                    </AppBadge>
                );
                if (status === "PROCESSING" || status === "2") return (
                    <AppBadge variant="info" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Đang chuyển
                    </AppBadge>
                );
                if (status === "REJECTED" || status === "5") return (
                    <AppBadge variant="error" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Bị từ chối
                    </AppBadge>
                );
                if (status === "FAILED" || status === "4") return (
                    <AppBadge variant="error" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Thất bại
                    </AppBadge>
                );
                return (
                    <AppBadge variant="secondary" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {status === "VOIDED" ? "Đã hủy" : status}
                    </AppBadge>
                );
            }
        }
    ];

    return (
        <div className="animate-fade-up">
            <DataTable 
                columns={columns}
                data={transactions}
                emptyState="Chưa có giao dịch nào được ghi nhận trong sổ cái."
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalElements: pagination.totalElements || transactions?.length || 0,
                    onPageChange: onPageChange,
                    zeroIndexed: true
                }}
            />
        </div>
    );
}

export default function InstructorRevenue() {
  const { wallet, transactions, loading, error, refetch } = useInstructorRevenue();
  const user = useAuthStore(state => state.user);
  
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    size: 10
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter((trx) => {
    // Tìm kiếm theo ID hoặc nội dung
    const searchString = searchTerm.toLowerCase();
    const matchSearch = (trx.reference || "").toLowerCase().includes(searchString) ||
      (trx.id || "").toString().toLowerCase().includes(searchString) ||
      (trx.maskedAccountNumber || "").toLowerCase().includes(searchString) ||
      (trx.bankName || "").toLowerCase().includes(searchString);
    
    // Lọc theo loại giao dịch
    let matchCategory = true;
    if (categoryFilter.length > 0) {
      matchCategory = categoryFilter.includes(trx.category);
    }

    // Lọc trạng thái
    let matchStatus = true;
    if (statusFilter.length > 0) {
      const s = typeof trx.status === 'string' ? trx.status.toUpperCase() : String(trx.status);
      const isSuccess = s === "COMPLETED" || s === "3";
      const isPending = s === "PENDING" || s === "1" || s === "PROCESSING" || s === "2" || s === "AWAITING_APPROVAL" || s === "6";
      const isFailed = s === "FAILED" || s === "4" || s === "REJECTED" || s === "5" || s === "VOIDED";

      matchStatus = (statusFilter.includes("success") && isSuccess) ||
                    (statusFilter.includes("pending") && isPending) ||
                    (statusFilter.includes("failed") && isFailed);
    }

    // Lọc theo khoảng thời gian
    let matchDate = true;
    if (dateRange?.from) {
      const trxDate = new Date(trx.createdAt);
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
      to.setHours(23, 59, 59, 999);
      matchDate = trxDate >= from && trxDate <= to;
    }

    return matchSearch && matchCategory && matchStatus && matchDate;
  });

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const totalPages = Math.ceil(filteredTransactions.length / pagination.size) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    pagination.currentPage * pagination.size,
    (pagination.currentPage + 1) * pagination.size
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải dữ liệu doanh thu & sổ cái...</p>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AppCard className="max-w-md p-6 text-center border-error/20 bg-card shadow-sm">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-2" />
          <h3 className="text-lg font-bold text-foreground">Không thể tải thông tin doanh thu</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Đã xảy ra lỗi khi tải số dư và sao kê ví. Vui lòng thử lại.
          </p>
          <AppButton onClick={() => refetch()} className="btn-md bg-primary text-white">
            Thử lại
          </AppButton>
        </AppCard>
      </div>
    );
  }

  const statCards = [
    {
      label: "Số dư khả dụng",
      value: formatVND(wallet?.remain),
      icon: WalletIcon,
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      borderClass: "border-primary/20",
      circleClass: "bg-primary/10 opacity-50 group-hover:opacity-100",
      sub: `${wallet?.withdrawalsToday || 0}/3 lượt rút hôm nay`
    },
    {
      label: "Đang giữ 30 ngày",
      value: formatVND(wallet?.pendingRevenue),
      icon: Clock,
      bgClass: "bg-warning/10",
      textClass: "text-warning",
      borderClass: "border-warning/20",
      circleClass: "bg-warning/10 opacity-50 group-hover:opacity-100",
      sub: "Tự động cộng vào số dư khi hết hạn"
    },
    {
      label: "Tổng doanh thu",
      value: formatVND(wallet?.totalGrossRevenue),
      icon: Banknote,
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
      circleClass: "bg-success/10 opacity-50 group-hover:opacity-100",
      sub: "Tổng tiền bán khóa học (chưa chiết khấu)"
    },
    {
      label: "Tổng thu nhập ròng",
      value: formatVND(wallet?.totalRevenue),
      icon: TrendingUp,
      bgClass: "bg-info/10",
      textClass: "text-info",
      borderClass: "border-info/20",
      circleClass: "bg-info/10 opacity-50 group-hover:opacity-100",
      sub: "Tổng thu nhập ròng tích lũy"
    },
  ];

  return (
    <div className="py-8 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Doanh Thu & Thanh Toán
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Theo dõi dòng tiền, sao kê giao dịch đa loại và yêu cầu rút tiền của bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <AppButton appVariant="ghostMuted" variant="ghost" className="btn-md font-bold flex items-center gap-2 border border-border hover:bg-muted transition-all rounded-lg">
            <Download className="w-4 h-4" />
            Xuất Excel
          </AppButton>
          <AppButton
            onClick={() => setIsWithdrawOpen(true)}
            className="btn-md bg-success text-white hover:bg-success/90 font-bold rounded-lg transition-all shadow-none hover:scale-[1.02]"
          >
            <WalletIcon className="w-4 h-4 mr-2" />
            Rút Tiền
          </AppButton>
        </div>
      </div>

      {/* Revenue Stats Cards (4 cards: Available, Pending 30d, Month Net, Total Net) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <AppCard key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl bg-card">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.circleClass} transition-colors duration-500`} />
            <AppCardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bgClass} ${stat.textClass} border ${stat.borderClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">{stat.label}</span>
                <span className="text-xl font-bold tracking-tight text-foreground truncate mt-0.5">{stat.value}</span>
                {stat.sub && (
                  <span className="text-[10px] font-medium text-muted-foreground mt-1 truncate">{stat.sub}</span>
                )}
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      {/* Transaction History Section */}
      <div className="space-y-6">
        <DataFilter
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm mã giao dịch, đơn hàng, ngân hàng..."
          dropdownChecklists={[
            {
              title: "Loại GD",
              items: [
                { label: "Thu nhập khóa học", value: "EARNING" },
                { label: "Rút tiền về ngân hàng", value: "WITHDRAWAL" },
                { label: "Hoàn tiền học viên", value: "REFUND" },
                { label: "Nạp tiền", value: "DEPOSIT" },
              ],
              selectedItems: categoryFilter,
              onItemToggle: (val) => setCategoryFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
              onClear: () => setCategoryFilter([])
            },
            {
              title: "Trạng thái",
              items: [
                { label: "Hoàn tất", value: "success" },
                { label: "Chờ duyệt / đang chuyển", value: "pending" },
                { label: "Thất bại / từ chối / hủy", value: "failed" },
              ],
              selectedItems: statusFilter,
              onItemToggle: (val) => setStatusFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
              onClear: () => setStatusFilter([])
            }
          ]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateRangePlaceholder="Khoảng thời gian"
        />

        <InstructorRevenueTable
          transactions={paginatedTransactions}
          pagination={{
            ...pagination,
            totalPages,
            totalElements: filteredTransactions.length
          }}
          onPageChange={handlePageChange}
        />
      </div>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        wallet={wallet}
        user={user}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

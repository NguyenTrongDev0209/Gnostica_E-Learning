import React, { useState, useEffect, useRef } from "react";
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
  X,
  CreditCard,
  Lock,
  Trash2,
  Landmark
} from "lucide-react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppDialog } from "@/components/common/micro/AppDialog";
import AppInput, { AppPasswordInput, AppInputOTP } from "@/components/common/micro/AppInput";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppAvatar from "@/components/common/micro/AppAvatar";
import AppBadge from "@/components/common/micro/AppBadge";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { useInstructorRevenue } from "@/hooks/payment/useInstructorRevenue";
import walletService from "@/services/payment/walletService";
import bankService from "@/services/payment/bankService";
import useAuthStore from "@/store/useAuthStore";
import WithdrawModal from "@/components/common/composite/WithdrawModal";


const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function InstructorRevenueTable({
    transactions,
    pagination = { currentPage: 0, totalPages: 1, totalElements: 0 },
    onPageChange,
}) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (trx, index) => (
                <span className="text-sm font-bold text-muted-foreground tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            )
        },
        {
            header: "Mã GD & Thời gian",
            render: (trx) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground flex items-center gap-1.5 capitalize">
                        RT-{trx.payoutCode || trx.id}
                        <ArrowDownRight className="w-3 h-3 text-rose-500" />
                    </span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">
                        {new Date(trx.createdAt).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            )
        },
        {
            header: "Nội dung",
            className: "max-w-[300px]",
            cellClassName: "max-w-[300px]",
            render: (trx) => (
                <span className="text-sm font-bold text-foreground line-clamp-1">
                    {trx.bankName
                        ? `Rút tiền về ${trx.bankName}`
                        : "Yêu cầu rút tiền"}
                </span>
            )
        },
        {
            header: "Phát sinh",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => (
                <span className="font-bold text-sm text-error">
                    -{formatVND(trx.amount)}
                </span>
            )
        },
        {
            header: "Loại",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => (
                <AppBadge variant="secondary" soft className="text-[10px] font-bold uppercase tracking-tight py-0">
                    Rút tiền
                </AppBadge>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => {
                if (trx.status === 3) return (
                    <AppBadge variant="success" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                    </AppBadge>
                );
                if (trx.status === 1 || trx.status === 2 || trx.status === 6) return (
                    <AppBadge variant="warning" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {trx.status === 1 ? "Chờ duyệt" : trx.status === 6 ? "Chờ admin duyệt" : "Đang chuyển"}
                    </AppBadge>
                );
                return (
                    <AppBadge variant="error" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {trx.status === 5 ? "Bị từ chối" : "Thất bại"}
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
                emptyState="Chưa có giao dịch nào được ghi nhận."
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
  const { wallet, transactions, loading } = useInstructorRevenue();
  const user = useAuthStore(state => state.user);
  
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    size: 10
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const filteredTransactions = (Array.isArray(transactions) ? transactions : []).filter((trx) => {
    // Tìm kiếm theo ID hoặc nội dung
    const searchString = searchTerm.toLowerCase();
    const matchSearch = `rt-${trx.payoutCode || trx.id}`.toLowerCase().includes(searchString) ||
      (trx.maskedAccountNumber || "").toLowerCase().includes(searchString) ||
      (trx.bankName || "").toLowerCase().includes(searchString);
    
    // Lọc trạng thái / loại
    let matchStatus = true;
    if (statusFilter.length > 0) {
      const allowedStatuses = [];
      if (statusFilter.includes("success")) allowedStatuses.push(3);
      if (statusFilter.includes("pending")) allowedStatuses.push(1, 2, 6); // 6 = chờ admin duyệt
      if (statusFilter.includes("failed")) allowedStatuses.push(4, 5);
      matchStatus = allowedStatuses.includes(trx.status);
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

    return matchSearch && matchStatus && matchDate;
  });

  const totalLifetime = Number(wallet?.totalRevenue || 0);
  const thisMonthRevenue = Number(wallet?.currentMonthRevenue || 0);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải dữ liệu doanh thu...</p>
      </div>
    );
  }

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
            Theo dõi dòng tiền, sao kê giao dịch và yêu cầu rút tiền của bạn.
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

      {/* Revenue Stats Cards (Standardized) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Số dư khả dụng",
            value: formatVND(wallet?.remain || 0),
            icon: WalletIcon,
            bgClass: "bg-primary/10",
            textClass: "text-primary",
            borderClass: "border-primary/20",
            circleClass: "bg-primary/10 opacity-50 group-hover:opacity-100",
            sub: `${wallet?.withdrawalsToday || 0}/3 lượt rút hôm nay`
          },
          {
            label: "Doanh thu tháng này",
            value: formatVND(thisMonthRevenue),
            icon: Activity,
            bgClass: "bg-success-soft",
            textClass: "text-success",
            borderClass: "border-success/20",
            circleClass: "bg-success-soft opacity-50 group-hover:opacity-100",
          },
          {
            label: "Tổng doanh thu",
            value: formatVND(totalLifetime),
            icon: TrendingUp,
            bgClass: "bg-info-soft",
            textClass: "text-info",
            borderClass: "border-info/20",
            circleClass: "bg-info-soft opacity-50 group-hover:opacity-100"
          },
        ].map((stat, i) => (
          <AppCard key={i} className={`group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl bg-white`}>
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.circleClass} transition-colors duration-500`} />
            <AppCardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bgClass} ${stat.textClass} border ${stat.borderClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  {stat.trend && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-0.5 border border-success/20">
                      <ArrowUpRight className="w-2.5 h-2.5" /> {stat.trend}
                    </span>
                  )}
                </div>
                <span className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</span>
                {stat.sub && (
                  <span className="text-[10px] font-bold text-muted-foreground mt-0.5">{stat.sub}</span>
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
          searchPlaceholder="Tìm mã giao dịch, ngân hàng..."
          dropdownChecklists={[
            {
              title: "Bộ lọc",
              items: [
                { label: "Hoàn tất", value: "success" },
                { label: "Chờ duyệt / đang chuyển", value: "pending" },
                { label: "Thất bại / từ chối", value: "failed" },
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
          transactions={filteredTransactions}
          pagination={{...pagination, totalElements: filteredTransactions.length, totalPages: Math.ceil(filteredTransactions.length / pagination.size) || 1}}
          onPageChange={handlePageChange}
        />
      </div>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        wallet={wallet}
        user={user}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

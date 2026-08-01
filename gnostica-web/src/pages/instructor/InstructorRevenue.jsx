import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Download,
  TrendingUp,
  Wallet as WalletIcon,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Building2,
  CreditCard,
  Lock,
  Trash2
} from "lucide-react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppDialog } from "@/components/common/micro/AppDialog";
import AppInput, { AppPasswordInput } from "@/components/common/micro/AppInput";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { useInstructorRevenue } from "@/hooks/payment/useInstructorRevenue";
import walletService from "@/services/payment/walletService";
import bankService from "@/services/payment/bankService";

const maskAccount = (num) => {
    if (!num || num.length < 4) return num;
    return "*".repeat(num.length - 4) + num.slice(-4);
};

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

// eslint-disable-next-line no-unused-vars
const InputField = ({ icon: Icon, label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" /> {label}
        </label>
        <input
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-success/20 focus:ring-1 focus:ring-green-500 outline-none transition-all"
            {...props}
        />
    </div>
);

function WithdrawModal({ isOpen, onClose, wallet, onSuccess }) {
    const hasBankAccount = !!(wallet?.accountNumber);

    const [step, setStep] = useState(hasBankAccount ? "withdraw" : "setup");
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [setupForm, setSetupForm] = useState({ bin: "", accountNumber: "", pin: "", pinConfirm: "" });
    const [withdrawForm, setWithdrawForm] = useState({ amount: "", pin: "" });
    const [removePin, setRemovePin] = useState("");

    useEffect(() => {
        if (isOpen) {
            setStep(hasBankAccount ? "withdraw" : "setup");
            setSetupForm({ bin: "", accountNumber: "", pin: "", pinConfirm: "" });
            setWithdrawForm({ amount: "", pin: "" });
            setRemovePin("");
            bankService.getBanks()
                .then(res => setBanks(res))
                .catch(() => toast.error("Không thể tải danh sách ngân hàng"));
        }
    }, [isOpen, hasBankAccount]);

    if (!isOpen) return null;

    const bankName = banks.find(b => b.bin === wallet?.bankBin)?.shortName || wallet?.bankBin;

    const handleSetup = async (e) => {
        e.preventDefault();
        const { bin, accountNumber, pin, pinConfirm } = setupForm;
        if (!bin || !accountNumber || !pin) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (pin.length < 4) {
            toast.error("PIN phải có ít nhất 4 ký tự");
            return;
        }
        if (pin !== pinConfirm) {
            toast.error("PIN xác nhận không khớp");
            return;
        }
        try {
            setLoading(true);
            await walletService.setBankAccount({ bin, accountNumber, pin });
            toast.success("Đã lưu tài khoản ngân hàng!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể lưu tài khoản ngân hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const { amount, pin } = withdrawForm;
        if (!amount || !pin) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (Number(amount) < 10000) {
            toast.error("Số tiền rút tối thiểu là 10.000đ");
            return;
        }
        if (Number(amount) > (wallet?.remain || 0)) {
            toast.error("Số dư khả dụng không đủ!");
            return;
        }
        try {
            setLoading(true);
            await walletService.requestWithdraw({ amount: Number(amount), pin });
            toast.success("Đã tạo lệnh rút tiền thành công!");
            if (onSuccess) onSuccess();
            onClose();
        } catch {
            toast.error("Hệ thống đang gặp sự cố. Vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (e) => {
        e.preventDefault();
        if (!removePin) {
            toast.error("Vui lòng nhập mã PIN");
            return;
        }
        try {
            setLoading(true);
            await walletService.removeBankAccount(removePin);
            toast.success("Đã xóa tài khoản ngân hàng!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Xác minh PIN thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppDialog
            open={isOpen}
            onOpenChange={(val) => !val && onClose()}
            title={
                step === "setup" ? "Thiết lập tài khoản ngân hàng" :
                step === "withdraw" ? "Yêu cầu rút tiền" : "Xóa tài khoản ngân hàng"
            }
            description={step === "setup" ? "Thiết lập một lần, dùng mãi về sau" : null}
            appVariant="outline"
            className="sm:max-w-md"
        >
            <div className="space-y-5 mt-4">
                <div className="bg-muted border border-border px-4 py-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Số dư khả dụng:</span>
                    <span className="text-lg font-bold text-success">{formatVND(wallet?.remain)}</span>
                </div>

                {step === "setup" && (
                    <form onSubmit={handleSetup} autoComplete="off" className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" /> Ngân hàng
                            </label>
                            <select
                                value={setupForm.bin}
                                onChange={e => setSetupForm(p => ({ ...p, bin: e.target.value }))}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-success/20 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                required
                            >
                                <option value="">-- Chọn ngân hàng --</option>
                                {banks.map(bank => (
                                    <option key={bank.id} value={bank.bin}>{bank.shortName}</option>
                                ))}
                            </select>
                        </div>
                        <AppInput
                            icon={CreditCard}
                            label="Số tài khoản"
                            type="text"
                            placeholder="Ví dụ: 190345..."
                            value={setupForm.accountNumber}
                            onChange={e => setSetupForm(p => ({ ...p, accountNumber: e.target.value }))}
                            required
                        />
                        <AppPasswordInput
                            icon={Lock}
                            label="Đặt mã PIN (tối thiểu 4 ký tự)"
                            placeholder="Nhập mã PIN"
                            value={setupForm.pin}
                            onChange={e => setSetupForm(p => ({ ...p, pin: e.target.value }))}
                            name="bank-account-setup-pin"
                            autoComplete="one-time-code"
                            required
                        />
                        <AppPasswordInput
                            icon={Lock}
                            label="Xác nhận mã PIN"
                            placeholder="Nhập lại mã PIN"
                            value={setupForm.pinConfirm}
                            onChange={e => setSetupForm(p => ({ ...p, pinConfirm: e.target.value }))}
                            name="bank-account-setup-pin-confirmation"
                            autoComplete="one-time-code"
                            required
                        />
                        <div className="pt-2 flex gap-3">
                            <AppButton appVariant="ghostMuted" variant="ghost" type="button" onClick={onClose} className="flex-1 border border-border">Hủy</AppButton>
                            <AppButton appVariant="gradient" type="submit" disabled={loading} className="flex-1 bg-success/10 text-success hover:bg-success/20">
                                {loading ? "Đang lưu..." : "Lưu tài khoản"}
                            </AppButton>
                        </div>
                    </form>
                )}

                {step === "withdraw" && (
                    <form onSubmit={handleWithdraw} autoComplete="off" className="space-y-4">
                        <div className="border border-border rounded-lg p-3 flex items-center justify-between bg-muted">
                            <div className="flex items-center gap-3">
                                <div className="bg-success/10 text-success p-2 rounded-lg border border-success/20">
                                    <CreditCard className="w-4 h-4 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{bankName || "Ngân hàng"}</p>
                                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{maskAccount(wallet?.accountNumber)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep("remove")}
                                className="text-xs font-semibold text-error hover:text-error/80 flex items-center gap-1 transition"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Đổi
                            </button>
                        </div>

                        <AppInput
                            type="number"
                            label="Số tiền rút (VND)"
                            icon={DollarSign}
                            labelRight={
                                <button
                                    type="button"
                                    onClick={() => setWithdrawForm(p => ({ ...p, amount: wallet?.remain || 0 }))}
                                    className="text-xs text-success hover:text-success font-bold"
                                >
                                    Rút tối đa
                                </button>
                            }
                            placeholder="0"
                            min="10000"
                            max={wallet?.remain || 0}
                            value={withdrawForm.amount}
                            onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))}
                            className="font-mono"
                            required
                        />

                        <AppPasswordInput
                            icon={Lock}
                            label="Mã PIN xác nhận"
                            placeholder="Nhập mã PIN"
                            value={withdrawForm.pin}
                            onChange={e => setWithdrawForm(p => ({ ...p, pin: e.target.value }))}
                            name="withdrawal-confirmation-pin"
                            autoComplete="one-time-code"
                            required
                        />

                        <div className="pt-2 flex gap-3">
                            <AppButton appVariant="ghostMuted" variant="ghost" type="button" onClick={onClose} className="flex-1 border border-border font-bold">Hủy</AppButton>
                            <AppButton appVariant="gradient" type="submit" disabled={loading} className="flex-1 bg-success/10 text-success hover:bg-success/20 font-bold">
                                {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                            </AppButton>
                        </div>
                    </form>
                )}

                {step === "remove" && (
                    <form onSubmit={handleRemove} autoComplete="off" className="space-y-4">
                        <div className="bg-red-50 border border-error/20 rounded-lg p-3 text-sm text-error">
                            Nhập mã PIN để xác nhận xóa tài khoản ngân hàng hiện tại.
                            Sau khi xóa, bạn có thể thiết lập tài khoản mới.
                        </div>

                        <AppPasswordInput
                            icon={Lock}
                            label="Mã PIN hiện tại"
                            placeholder="Nhập mã PIN"
                            value={removePin}
                            onChange={e => setRemovePin(e.target.value)}
                            name="bank-account-removal-pin"
                            autoComplete="one-time-code"
                            required
                        />

                        <div className="pt-2 flex gap-3">
                            <AppButton appVariant="ghostMuted" variant="ghost"
                                type="button"
                                onClick={() => setStep("withdraw")}
                                className="flex-1 border border-border font-bold"
                            >
                                Quay lại
                            </AppButton>
                            <AppButton appVariant="gradient"
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-error/10 text-error hover:bg-error/20 font-bold"
                            >
                                {loading ? "Đang xử lý..." : "Xác nhận xóa"}
                            </AppButton>
                        </div>
                    </form>
                )}
            </div>
        </AppDialog>
    );
}

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
                        TRX-{trx.id}
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
                    {trx.accountBank?.bank?.shortName
                        ? `Rút tiền về ${trx.accountBank.bank.shortName}`
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
                if (trx.status === 1 || trx.status === 2) return (
                    <AppBadge variant="warning" soft className="text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {trx.status === 1 ? "Chờ duyệt" : "Đang chuyển"}
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
    const matchSearch = `trx-${trx.id}`.toLowerCase().includes(searchString) ||
      (trx.accountBank?.accountNumber || "").toLowerCase().includes(searchString) ||
      (trx.accountBank?.bank?.shortName || "").toLowerCase().includes(searchString);
    
    // Lọc trạng thái / loại
    let matchStatus = true;
    if (statusFilter.length > 0) {
      const allowedStatuses = [];
      if (statusFilter.includes("success")) allowedStatuses.push(3);
      if (statusFilter.includes("pending")) allowedStatuses.push(1, 2);
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

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

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
            trend: "+0%"
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
        <div className="flex items-center justify-between glass p-4 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Lịch Sử Rút Tiền</h2>
              <p className="text-xs font-medium text-muted-foreground">Danh sách các yêu cầu rút tiền từ ví của bạn.</p>
            </div>
          </div>
        </div>

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
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

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
import { AppButton } from "@/components/common/micro/AppButton";
import AppBadge from "@/components/common/micro/AppBadge";
import DataTable from "@/components/common/composite/DataTable";
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
        } catch (err) {
            toast.error(err?.response?.data?.message || "Rút tiền thất bại. Vui lòng thử lại!");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {step === "setup" && "Thiết lập tài khoản ngân hàng"}
                                {step === "withdraw" && "Yêu cầu rút tiền"}
                                {step === "remove" && "Xóa tài khoản ngân hàng"}
                            </h2>
                            {step === "setup" && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Thiết lập một lần, dùng mãi về sau
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-muted-foreground rounded-full hover:bg-secondary transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-muted border border-border px-4 py-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Số dư khả dụng:</span>
                        <span className="text-lg font-black text-success">{formatVND(wallet?.remain)}</span>
                    </div>

                    {step === "setup" && (
                        <form onSubmit={handleSetup} className="space-y-4">
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
                            <InputField
                                icon={CreditCard}
                                label="Số tài khoản"
                                type="text"
                                placeholder="Ví dụ: 190345..."
                                value={setupForm.accountNumber}
                                onChange={e => setSetupForm(p => ({ ...p, accountNumber: e.target.value }))}
                                required
                            />
                            <InputField
                                icon={Lock}
                                label="Đặt mã PIN (tối thiểu 4 ký tự)"
                                type="password"
                                placeholder="Nhập mã PIN"
                                value={setupForm.pin}
                                onChange={e => setSetupForm(p => ({ ...p, pin: e.target.value }))}
                                required
                            />
                            <InputField
                                icon={Lock}
                                label="Xác nhận mã PIN"
                                type="password"
                                placeholder="Nhập lại mã PIN"
                                value={setupForm.pinConfirm}
                                onChange={e => setSetupForm(p => ({ ...p, pinConfirm: e.target.value }))}
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
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div className="border border-border rounded-lg p-3 flex items-center justify-between bg-muted">
                                <div className="flex items-center gap-3">
                                    <div className="bg-success/10 text-success p-2 rounded-lg">
                                        <CreditCard className="w-4 h-4 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{bankName || "Ngân hàng"}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{maskAccount(wallet?.accountNumber)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep("remove")}
                                    className="text-xs text-error hover:text-error flex items-center gap-1 transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Đổi
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" /> Số tiền rút (VND)
                                    </span>
                                    <span
                                        onClick={() => setWithdrawForm(p => ({ ...p, amount: wallet?.remain || 0 }))}
                                        className="text-xs text-success hover:text-success font-bold cursor-pointer"
                                    >
                                        Rút tối đa
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    min="10000"
                                    max={wallet?.remain || 0}
                                    value={withdrawForm.amount}
                                    onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:border-success/20 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono"
                                    required
                                />
                            </div>

                            <InputField
                                icon={Lock}
                                label="Mã PIN xác nhận"
                                type="password"
                                placeholder="Nhập mã PIN"
                                value={withdrawForm.pin}
                                onChange={e => setWithdrawForm(p => ({ ...p, pin: e.target.value }))}
                                required
                            />

                            <div className="pt-2 flex gap-3">
                                <AppButton appVariant="ghostMuted" variant="ghost" type="button" onClick={onClose} className="flex-1 border border-border">Hủy</AppButton>
                                <AppButton appVariant="gradient" type="submit" disabled={loading} className="flex-1 bg-success/10 text-success hover:bg-success/20">
                                    {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                                </AppButton>
                            </div>
                        </form>
                    )}

                    {step === "remove" && (
                        <form onSubmit={handleRemove} className="space-y-4">
                            <div className="bg-red-50 border border-error/20 rounded-lg p-3 text-sm text-error">
                                Nhập mã PIN để xác nhận xóa tài khoản ngân hàng hiện tại.
                                Sau khi xóa, bạn có thể thiết lập tài khoản mới.
                            </div>

                            <InputField
                                icon={Lock}
                                label="Mã PIN hiện tại"
                                type="password"
                                placeholder="Nhập mã PIN"
                                value={removePin}
                                onChange={e => setRemovePin(e.target.value)}
                                required
                            />

                            <div className="pt-2 flex gap-3">
                                <AppButton appVariant="ghostMuted" variant="ghost"
                                    type="button"
                                    onClick={() => setStep("withdraw")}
                                    className="flex-1 border border-border"
                                >
                                    Quay lại
                                </AppButton>
                                <AppButton appVariant="gradient"
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-error/10 text-error hover:bg-error/20"
                                >
                                    {loading ? "Đang xử lý..." : "Xác nhận xóa"}
                                </AppButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
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
                <span className="text-2xs font-bold text-muted-foreground tracking-tighter">
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
                        {trx.type === 1 ? (
                            <ArrowUpRight className="w-3 h-3 text-success" />
                        ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-500" />
                        )}
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
                <span className="text-sm font-bold text-foreground line-clamp-1" title={trx.ref}>
                    {trx.ref || "Không có nội dung"}
                </span>
            )
        },
        {
            header: "Phát sinh",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => (
                <span className={`font-black text-sm ${trx.type === 1 ? "text-success" : "text-rose-600"}`}>
                    {trx.type === 1 ? "+" : "-"}{formatVND(trx.amount)}
                </span>
            )
        },
        {
            header: "Loại",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => (
                <AppBadge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0 bg-muted border-border text-muted-foreground">
                    {trx.paymentMethod === "REVENUE" ? "Thanh toán khóa học" :
                        trx.paymentMethod === "WITHDRAW" ? "Rút tiền mặt" : trx.paymentMethod}
                </AppBadge>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center",
            cellClassName: "text-center",
            render: (trx) => {
                if (trx.status === 1) return (
                    <AppBadge className="bg-green-50 text-success border-success/20 shadow-none hover:bg-green-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                    </AppBadge>
                );
                if (trx.status === 0) return (
                    <AppBadge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none hover:bg-amber-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Đang chờ
                    </AppBadge>
                );
                return (
                    <AppBadge className="bg-rose-50 text-rose-700 border-rose-200 shadow-none hover:bg-rose-50 text-[10px] font-bold py-0.5 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Thất bại
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

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalLifetime = Array.isArray(transactions)
    ? transactions
      .filter(t => t.type === 1 && t.paymentMethod === "REVENUE")
      .reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const thisMonthRevenue = Array.isArray(transactions)
    ? transactions
      .filter(t => t.type === 1 && t.paymentMethod === "REVENUE" && new Date(t.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + t.amount, 0)
    : 0;

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
          <h1 className="text-h1 font-black text-foreground tracking-tight leading-none">Doanh Thu & Thanh Toán</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Theo dõi dòng tiền, sao kê giao dịch và yêu cầu rút tiền của bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <AppButton appVariant="ghostMuted" variant="ghost" className="btn-md font-bold flex items-center gap-2 border border-border hover:bg-muted transition-all rounded-xl">
            <Download className="w-4 h-4" />
            Xuất Excel
          </AppButton>
          <AppButton appVariant="gradient"
            onClick={() => setIsWithdrawOpen(true)}
            className="btn-md bg-success/10 text-success hover:bg-success/20 font-bold rounded-xl transition-all hover:scale-[1.02]"
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
            color: "slate",
            dark: true,
            sub: `${wallet?.withdrawalsToday || 0}/3 lượt rút hôm nay`
          },
          {
            label: "Doanh thu tháng này",
            value: formatVND(thisMonthRevenue),
            icon: Activity,
            color: "green",
            trend: "+0%"
          },
          {
            label: "Tổng doanh thu",
            value: formatVND(totalLifetime),
            icon: TrendingUp,
            color: "blue"
          },
        ].map((stat, i) => (
          <AppCard key={i} className={`group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl ${stat.dark ? 'bg-muted text-white' : 'bg-white'}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.dark ? 'bg-white/5' : `bg-${stat.color}-50/50 group-hover:bg-${stat.color}-100/50`} transition-colors duration-500`} />
            <AppCardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.dark ? 'bg-white/10 text-white' : `bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100`} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.dark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{stat.label}</span>
                  {stat.trend && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-success flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5" /> {stat.trend}
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black tracking-tight ${stat.dark ? 'text-white' : 'text-foreground'}`}>{stat.value}</span>
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
              <h2 className="text-lg font-black text-foreground tracking-tight">Lịch Sử Giao Dịch</h2>
              <p className="text-xs font-bold text-muted-foreground">Danh sách các giao dịch phát sinh trong ví của bạn.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-muted-foreground bg-muted/80 p-2 rounded-xl border border-border/50">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <InstructorRevenueTable
          transactions={transactions}
          pagination={{...pagination, totalElements: transactions.length, totalPages: Math.ceil(transactions.length / pagination.size) || 1}}
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

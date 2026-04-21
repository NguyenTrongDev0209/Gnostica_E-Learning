import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Building2, CreditCard, DollarSign, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import walletService from "@/services/walletService";
import bankService from "@/services/bankService";

// ─── helpers ────────────────────────────────────────────────────────────────
const maskAccount = (num) => {
    if (!num || num.length < 4) return num;
    return "*".repeat(num.length - 4) + num.slice(-4);
};

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

// ─── InputField — đặt NGOÀI component để tránh mất focus khi re-render ──────
const InputField = ({ icon: Icon, label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-400" /> {label}
        </label>
        <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
            {...props}
        />
    </div>
);

// ─── Component ───────────────────────────────────────────────────────────────
export default function WithdrawModal({ isOpen, onClose, wallet, onSuccess }) {
    const hasBankAccount = !!(wallet?.accountNumber);

    // "setup" | "withdraw" | "remove"
    const [step, setStep] = useState(hasBankAccount ? "withdraw" : "setup");

    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Setup form
    const [setupForm, setSetupForm] = useState({ bin: "", accountNumber: "", pin: "", pinConfirm: "" });

    // Withdraw form
    const [withdrawForm, setWithdrawForm] = useState({ amount: "", pin: "" });

    // Remove form
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

    // ── Step: SETUP ─────────────────────────────────────────────────────────
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

    // ── Step: WITHDRAW ──────────────────────────────────────────────────────
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

    // ── Step: REMOVE ────────────────────────────────────────────────────────
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

                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {step === "setup" && "Thiết lập tài khoản ngân hàng"}
                                {step === "withdraw" && "Yêu cầu rút tiền"}
                                {step === "remove" && "Xóa tài khoản ngân hàng"}
                            </h2>
                            {step === "setup" && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Thiết lập một lần, dùng mãi về sau
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Balance */}
                    <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Số dư khả dụng:</span>
                        <span className="text-lg font-black text-green-600">{formatVND(wallet?.remain)}</span>
                    </div>

                    {/* ── STEP: SETUP ─────────────────────────────────────── */}
                    {step === "setup" && (
                        <form onSubmit={handleSetup} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" /> Ngân hàng
                                </label>
                                <select
                                    value={setupForm.bin}
                                    onChange={e => setSetupForm(p => ({ ...p, bin: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
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
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
                                <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-none">
                                    {loading ? "Đang lưu..." : "Lưu tài khoản"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* ── STEP: WITHDRAW ───────────────────────────────────── */}
                    {step === "withdraw" && (
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            {/* Saved bank info */}
                            <div className="border border-slate-200 rounded-lg p-3 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <CreditCard className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{bankName || "Ngân hàng"}</p>
                                        <p className="text-xs text-slate-400 font-mono">{maskAccount(wallet?.accountNumber)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep("remove")}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Đổi
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-slate-400" /> Số tiền rút (VND)
                                    </span>
                                    <span
                                        onClick={() => setWithdrawForm(p => ({ ...p, amount: wallet?.remain || 0 }))}
                                        className="text-xs text-green-600 hover:text-green-700 font-bold cursor-pointer"
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
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono"
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
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
                                <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-none">
                                    {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* ── STEP: REMOVE ─────────────────────────────────────── */}
                    {step === "remove" && (
                        <form onSubmit={handleRemove} className="space-y-4">
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600">
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep("withdraw")}
                                    className="flex-1"
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-none"
                                >
                                    {loading ? "Đang xử lý..." : "Xác nhận xóa"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

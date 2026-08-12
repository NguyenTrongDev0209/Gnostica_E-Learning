import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Wallet as WalletIcon, Banknote, CreditCard, Landmark, Trash2, Clock } from "lucide-react";
import { AppDialog } from "@/components/common/micro/AppDialog";
import AppInput, { AppInputOTP } from "@/components/common/micro/AppInput";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppAvatar from "@/components/common/micro/AppAvatar";
import walletService from "@/services/payment/walletService";
import bankService from "@/services/payment/bankService";

const maskAccount = (num) => {
    if (!num || num.length < 4) return num;
    return "*".repeat(num.length - 4) + num.slice(-4);
};

const formatVND = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

const formatCurrency = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const MANUAL_APPROVAL_THRESHOLD = 5000000;

export default function WithdrawModal({ isOpen, onClose, wallet, user, onSuccess }) {
    const hasBankAccount = !!(wallet?.accountNumber);

    const [step, setStep] = useState(hasBankAccount ? "withdraw" : "setup");
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const withdrawalIdempotencyKeyRef = useRef(null);

    const [setupForm, setSetupForm] = useState({ bin: "", accountNumber: "", pin: "", pinConfirm: "" });
    const [setupErrors, setSetupErrors] = useState({});
    const [withdrawForm, setWithdrawForm] = useState({ amount: "", pin: "" });
    const [removePin, setRemovePin] = useState("");

    useEffect(() => {
        if (isOpen) {
            setStep(hasBankAccount ? "withdraw" : "setup");
            setSetupForm({ bin: "", accountNumber: "", pin: "", pinConfirm: "" });
            setSetupErrors({});
            setWithdrawForm({ amount: "", pin: "" });
            setRemovePin("");
            withdrawalIdempotencyKeyRef.current = globalThis.crypto?.randomUUID?.().replaceAll("-", "")
                || `${Date.now()}${Math.random().toString(36).slice(2)}`;
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
        const errors = {};
        if (!bin) errors.bin = "Vui lòng chọn ngân hàng.";
        if (!accountNumber) errors.accountNumber = "Vui lòng nhập số tài khoản.";
        else if (!/^\d{6,25}$/.test(accountNumber)) errors.accountNumber = "Số tài khoản phải gồm 6 đến 25 chữ số.";
        if (!/^\d{6}$/.test(pin)) errors.pin = "PIN phải gồm đúng 6 chữ số.";
        if (!pinConfirm) errors.pinConfirm = "Vui lòng xác nhận mã PIN.";
        else if (pin !== pinConfirm) errors.pinConfirm = "PIN xác nhận không khớp.";
        if (Object.keys(errors).length > 0) {
            setSetupErrors(errors);
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
            await walletService.requestWithdraw(
                { amount: Number(amount), pin },
                withdrawalIdempotencyKeyRef.current
            );
            if (Number(amount) >= MANUAL_APPROVAL_THRESHOLD) {
                toast.success("Yêu cầu rút tiền đã gửi. Lệnh rút từ 5.000.000đ trở lên cần admin duyệt thủ công trước khi chuyển khoản.");
            } else {
                toast.success("Đã tạo lệnh rút tiền thành công!");
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Hệ thống đang gặp sự cố. Vui lòng thử lại");
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
            description={null}
            appVariant="outline"
            className="sm:max-w-[460px]"
        >
            <div className="space-y-6 mt-2">
                {step !== "setup" && <div className="rounded-xl border border-success bg-success px-4 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg text-white">
                            <WalletIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Số dư khả dụng</p>
                            <p className="text-xs text-white/80">Số lượt rút trong ngày còn {Math.max(0, 3 - (wallet?.withdrawalsToday || 0))}/3</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">{formatVND(wallet?.remain)}</span>
                </div>}

                {step === "setup" && (
                    <form onSubmit={handleSetup} autoComplete="off" noValidate className="space-y-5">
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3.5 py-3">
                            <AppAvatar
                                src={user?.avatar}
                                alt={user?.fullName || user?.name || "Giảng viên"}
                                size="default"
                                className="ring-2 ring-background ring-offset-2 ring-primary/20"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {user?.fullName || user?.name || "Giảng viên"}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{user?.email || "—"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-muted-foreground" /> Ngân hàng
                            </label>
                            <AppSelect
                                value={setupForm.bin}
                                onValueChange={bin => {
                                    setSetupForm(p => ({ ...p, bin }));
                                    if (setupErrors.bin) setSetupErrors(p => ({ ...p, bin: "" }));
                                }}
                                placeholder="Chọn ngân hàng nhận tiền"
                                options={banks.map(bank => ({ value: bank.bin, label: bank.shortName, imageUrl: bank.logoUrl }))}
                                error={Boolean(setupErrors.bin)}
                            />
                            {setupErrors.bin && <p className="mt-1 text-xs text-error">{setupErrors.bin}</p>}
                        </div>
                        <AppInput
                            icon={CreditCard}
                            label="Số tài khoản"
                            type="text"
                            placeholder="Ví dụ: 190345..."
                            value={setupForm.accountNumber}
                            onChange={e => {
                                setSetupForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, "") }));
                                if (setupErrors.accountNumber) setSetupErrors(p => ({ ...p, accountNumber: "" }));
                            }}
                            error={setupErrors.accountNumber}
                        />
                        </div>
                        <div className="space-y-4">
                        <AppInputOTP
                            label="Đặt mã PIN (6 chữ số)"
                            value={setupForm.pin}
                            onChange={val => {
                                setSetupForm(p => ({ ...p, pin: val }));
                                if (setupErrors.pin) setSetupErrors(p => ({ ...p, pin: "" }));
                            }}
                            maxLength={6}
                            error={setupErrors.pin}
                            containerClassName="[&_[data-slot=input-otp-group]]:w-full [&_[data-slot=input-otp-slot]]:flex-1 [&_[data-slot=input-otp-slot]]:[-webkit-text-security:disc]"
                        />
                        <AppInputOTP
                            label="Xác nhận mã PIN"
                            value={setupForm.pinConfirm}
                            onChange={val => {
                                setSetupForm(p => ({ ...p, pinConfirm: val }));
                                if (setupErrors.pinConfirm) setSetupErrors(p => ({ ...p, pinConfirm: "" }));
                            }}
                            maxLength={6}
                            error={setupErrors.pinConfirm}
                            containerClassName="[&_[data-slot=input-otp-group]]:w-full [&_[data-slot=input-otp-slot]]:flex-1 [&_[data-slot=input-otp-slot]]:[-webkit-text-security:disc]"
                        />
                        </div>
                        <div className="pt-1 flex gap-3">
                            <AppButton appVariant="ghostMuted" variant="default" type="button" onClick={onClose} className="flex-1 bg-error text-white hover:bg-error/90 font-bold border-none">Hủy</AppButton>
                            <AppButton appVariant="ghostMuted" variant="default" type="submit" disabled={loading} className="flex-1 bg-success text-white hover:bg-success/90 font-bold border-none">
                                {loading ? "Đang lưu..." : "Lưu tài khoản"}
                            </AppButton>
                        </div>
                    </form>
                )}

                {step === "withdraw" && (
                    <form onSubmit={handleWithdraw} autoComplete="off" noValidate className="space-y-4">
                        <div className="border border-border rounded-lg p-3 flex items-center justify-between bg-background shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-success text-white p-2 rounded-lg border border-success/20">
                                    <CreditCard className="w-4 h-4 text-white" />
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
                            type="text"
                            label="Số tiền rút (VND)"
                            icon={Banknote}
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
                            value={withdrawForm.amount ? formatCurrency(withdrawForm.amount) : ""}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, "");
                                setWithdrawForm(p => ({ ...p, amount: val }));
                            }}
                        />

                        {Number(withdrawForm.amount || 0) >= MANUAL_APPROVAL_THRESHOLD && (
                            <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                Lệnh rút từ {formatVND(MANUAL_APPROVAL_THRESHOLD)} trở lên cần admin duyệt thủ công trước khi chuyển khoản.
                            </div>
                        )}

                        <AppInputOTP
                            label="Mã PIN xác nhận"
                            value={withdrawForm.pin}
                            onChange={val => setWithdrawForm(p => ({ ...p, pin: val }))}
                            maxLength={6}
                            containerClassName="[&_[data-slot=input-otp-group]]:w-full [&_[data-slot=input-otp-slot]]:flex-1 [&_[data-slot=input-otp-slot]]:[-webkit-text-security:disc]"
                        />

                        <div className="pt-2 flex gap-3">
                            <AppButton appVariant="ghostMuted" variant="default" type="button" onClick={onClose} className="flex-1 bg-error text-white hover:bg-error/90 font-bold border-none">Hủy</AppButton>
                            <AppButton appVariant="ghostMuted" variant="default" type="submit" disabled={loading} className="flex-1 bg-success text-white hover:bg-success/90 font-bold border-none">
                                {loading ? "Đang xử lý..." : "Xác nhận"}
                            </AppButton>
                        </div>
                    </form>
                )}

                {step === "remove" && (
                    <form onSubmit={handleRemove} autoComplete="off" noValidate className="space-y-4">
                        <div className="bg-red-50 border border-error/20 rounded-lg p-3 text-sm text-error">
                            Nhập mã PIN để xác nhận xóa tài khoản ngân hàng hiện tại.
                            Sau khi xóa, bạn có thể thiết lập tài khoản mới.
                        </div>

                        <AppInputOTP
                            label="Mã PIN hiện tại"
                            value={removePin}
                            onChange={val => setRemovePin(val)}
                            maxLength={6}
                            containerClassName="[&_[data-slot=input-otp-group]]:w-full [&_[data-slot=input-otp-slot]]:flex-1 [&_[data-slot=input-otp-slot]]:[-webkit-text-security:disc]"
                        />

                        <div className="pt-2 flex gap-3">
                            <AppButton appVariant="ghostMuted" variant="default"
                                type="button"
                                onClick={() => setStep("withdraw")}
                                className="flex-1 bg-error text-white hover:bg-error/90 font-bold border-none"
                            >
                                Quay lại
                            </AppButton>
                            <AppButton appVariant="ghostMuted" variant="default"
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-success text-white hover:bg-success/90 font-bold border-none"
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

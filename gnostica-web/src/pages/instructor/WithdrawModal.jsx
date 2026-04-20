import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, BuildingIcon, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import walletService from "@/services/walletService";
import bankService from "@/services/bankService";

export default function WithdrawModal({ isOpen, onClose, wallet, onSuccess }) {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        bin: "",
        accountNumber: "",
        amount: ""
    });

    useEffect(() => {
        if (isOpen) {
            bankService.getBanks()
                .then(res => setBanks(res))
                .catch(err => {
                    console.error("Failed to load banks", err);
                    toast.error("Không thể tải danh sách ngân hàng");
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const setMaxAmount = () => {
        if (wallet?.remain) {
            setFormData(prev => ({ ...prev, amount: wallet.remain }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.bin || !formData.accountNumber || !formData.amount) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (Number(formData.amount) > (wallet?.remain || 0)) {
            toast.error("Số dư khả dụng không đủ!");
            return;
        }

        if (Number(formData.amount) < 10000) {
            toast.error("Số tiền rút tối thiểu là 10.000đ");
            return;
        }

        try {
            setLoading(true);
            await walletService.requestWithdraw({
                bin: formData.bin,
                accountNumber: formData.accountNumber,
                amount: Number(formData.amount)
            });
            toast.success("Đã tạo lệnh rút tiền thành công!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Rút tiền thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Yêu cầu rút tiền</h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg mb-6 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Số dư khả dụng:</span>
                        <span className="text-lg font-black text-green-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.remain || 0)}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <BuildingIcon className="w-4 h-4 text-slate-400" /> Ngân hàng
                            </label>
                            <select
                                name="bin"
                                value={formData.bin}
                                onChange={handleChange}
                                className="w-full border-slate-200 rounded-lg outline-none ring-0 placeholder:text-slate-400 transition-all px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 border"
                                required
                            >
                                <option value="">-- Chọn ngân hàng --</option>
                                {banks.map(bank => (
                                    <option key={bank.id} value={bank.bin}>{bank.shortName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-400" /> Số tài khoản
                            </label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="w-full border-slate-200 rounded-lg outline-none ring-0 placeholder:text-slate-400 transition-all px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 border"
                                placeholder="Ví dụ: 190345..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-slate-400" /> Số tiền rút (VND)
                                </span>
                                <span
                                    onClick={setMaxAmount}
                                    className="text-xs text-green-600 hover:text-green-700 font-bold cursor-pointer"
                                >
                                    Rút tối đa
                                </span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                min="10000"
                                max={wallet?.remain || 0}
                                className="w-full border-slate-200 rounded-lg outline-none ring-0 placeholder:text-slate-400 transition-all px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 border font-mono"
                                placeholder="0"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-none">
                                {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

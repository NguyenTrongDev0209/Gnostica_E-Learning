import React, { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  Wallet as WalletIcon,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Loader2,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import walletService from "@/services/walletService";
import { toast } from "sonner";
import WithdrawModal from "./WithdrawModal";
import InstructorRevenueTable from "@/components/pages/instructor/revenue/InstructorRevenueTable";

export default function InstructorRevenue() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    size: 10
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [walletData, transactionsData] = await Promise.all([
          walletService.getMyWallet(),
          walletService.getMyTransactions()
        ]);
        setWallet(walletData);
        const trxs = Array.isArray(transactionsData) ? transactionsData : [];
        setTransactions(trxs);
        setPagination(prev => ({
          ...prev,
          totalElements: trxs.length,
          totalPages: Math.ceil(trxs.length / prev.size) || 1
        }));
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        toast.error("Không thể tải dữ liệu doanh thu");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    // Note: Backend currently doesn't support pagination for transactions, 
    // so this is a UI placeholder for future integration.
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
          <h1 className="text-h1 font-black text-slate-900 tracking-tight leading-none">Doanh Thu & Thanh Toán</h1>
          <p className="text-sm font-medium text-slate-500">
            Theo dõi dòng tiền, sao kê giao dịch và yêu cầu rút tiền của bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="btn-md font-bold flex items-center gap-2 border-border hover:bg-muted transition-all rounded-xl">
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
          <Button
            onClick={() => setIsWithdrawOpen(true)}
            className="btn-md bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100 font-bold rounded-xl transition-all hover:scale-[1.02]"
          >
            <WalletIcon className="w-4 h-4 mr-2" />
            Rút Tiền
          </Button>
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
          <Card key={i} className={`group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl ${stat.dark ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.dark ? 'bg-white/5' : `bg-${stat.color}-50/50 group-hover:bg-${stat.color}-100/50`} transition-colors duration-500`} />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.dark ? 'bg-white/10 text-white' : `bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100`} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.dark ? 'text-slate-400' : 'text-muted-foreground'}`}>{stat.label}</span>
                  {stat.trend && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5" /> {stat.trend}
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-black tracking-tight ${stat.dark ? 'text-white' : 'text-foreground'}`}>{stat.value}</span>
                {stat.sub && (
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">{stat.sub}</span>
                )}
              </div>
            </CardContent>
          </Card>
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
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Lịch Sử Giao Dịch</h2>
              <p className="text-xs font-bold text-slate-500">Danh sách các giao dịch phát sinh trong ví của bạn.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-muted-foreground bg-muted/80 p-2 rounded-xl border border-border/50">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <InstructorRevenueTable
          transactions={transactions}
          pagination={pagination}
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


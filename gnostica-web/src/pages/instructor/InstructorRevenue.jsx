import React, { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  Wallet as WalletIcon,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart as BarChartIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import walletService from "@/services/walletService";
import { toast } from "sonner";
import WithdrawModal from "./WithdrawModal";

export default function InstructorRevenue() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletData, transactionsData] = await Promise.all([
          walletService.getMyWallet(),
          walletService.getMyTransactions()
        ]);
        setWallet(walletData);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        toast.error("Không thể tải dữ liệu doanh thu");
        setTransactions([]); // Safe fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Prepare chart data (Last 7 transactions or group by day if possible)
  // For now, let's just use the last few transactions to simulate the chart
  const chartData = Array.isArray(transactions)
    ? [...transactions].slice(0, 7).reverse().map(t => ({
      day: new Date(t.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      amount: t.amount
    }))
    : [];

  const totalLifetime = Array.isArray(transactions)
    ? transactions
      .filter(t => t.type === 1 && t.paymentMethod === "REVENUE")
      .reduce((sum, t) => sum + t.amount, 0)
    : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doanh Thu & Thanh Toán</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi dòng tiền, sao kê giao dịch và yêu cầu rút tiền.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold flex items-center gap-2 border-slate-200">
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
          <Button
            onClick={() => setIsWithdrawOpen(true)}
            className="font-bold flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-none">
            <WalletIcon className="w-4 h-4" />
            Rút Tiền
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/20 shadow-none border-none">
                Sẵn sàng rút
              </Badge>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <p className="text-sm font-medium text-slate-300">Số dư khả dụng</p>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  {wallet?.withdrawalsToday || 0}/3 lượt rút hôm nay
                </div>
              </div>
              <h2 className="text-3xl font-black text-white">{formatVND(wallet?.remain || 0)}</h2>
            </div>
          </CardContent>
        </Card>

        {/* This Month (Approximated) */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-green-700 bg-green-50">
                <ArrowUpRight className="w-3 h-3" />
                +0%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Doanh thu dự kiến tháng này</p>
              <h2 className="text-3xl font-black text-slate-900">
                {formatVND(Array.isArray(transactions)
                  ? transactions
                    .filter(t => t.type === 1 && t.paymentMethod === "REVENUE" && new Date(t.createdAt).getMonth() === new Date().getMonth())
                    .reduce((sum, t) => sum + t.amount, 0)
                  : 0
                )}
              </h2>
            </div>
          </CardContent>
        </Card>

        {/* Total Lifetime */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tổng doanh thu toàn thời gian</p>
              <h2 className="text-3xl font-black text-slate-900">{formatVND(totalLifetime)}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Thống Kê Doanh Thu</CardTitle>
            <CardDescription>Biến động doanh thu qua các giao dịch gần đây</CardDescription>
          </div>
          <BarChartIcon className="w-5 h-5 text-slate-400" />
        </CardHeader>
        <CardContent className="h-[320px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [formatVND(value), "Doanh thu"]}
              />
              <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#15803d' : '#22c55e'} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 bg-white">
          <CardTitle className="text-lg font-bold text-slate-900">Lịch Sử Giao Dịch Mới Nhất</CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </div>
        </CardHeader>
        <div className="overflow-x-auto bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700">Mã GD & Thời gian</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Nội dung</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Phát sinh</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Loại</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(transactions) || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Chưa có giao dịch nào</TableCell>
                </TableRow>
              ) : (
                transactions.map((trx) => (
                  <TableRow key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">TRX-{trx.id}</span>
                        <span className="text-xs text-slate-500">{new Date(trx.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {trx.ref || "Không có nội dung"}
                    </TableCell>
                    <TableCell className="text-right font-black text-green-600">
                      {trx.type === 1 ? "+" : "-"}{formatVND(trx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {trx.paymentMethod === "REVENUE" ? "Thanh toán khóa học" : trx.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {trx.status === 1 && <Badge className="bg-green-100 text-green-700 shadow-none hover:bg-green-100">Thành công</Badge>}
                      {trx.status === 0 && <Badge className="bg-amber-100 text-amber-700 shadow-none hover:bg-amber-100">Đang chờ</Badge>}
                      {trx.status === 2 && <Badge className="bg-red-100 text-red-700 shadow-none hover:bg-red-100">Thất bại</Badge>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-slate-100 text-center">
          <Button variant="link" className="text-green-600 hover:text-green-700 font-bold">
            Xem toàn bộ lịch sử giao dịch &rarr;
          </Button>
        </div>
      </Card>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        wallet={wallet}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}


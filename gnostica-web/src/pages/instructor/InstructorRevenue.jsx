import React from "react";
import { 
  Download, 
  TrendingUp, 
  Wallet, 
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

// Dữ liệu doanh thu 30 ngày qua (Mock data)
const REVENUE_BY_DAY = [
  { day: "01/03", amount: 1500000 },
  { day: "05/03", amount: 2800000 },
  { day: "10/03", amount: 1200000 },
  { day: "15/03", amount: 4500000 },
  { day: "20/03", amount: 3200000 },
  { day: "25/03", amount: 5600000 },
  { day: "30/03", amount: 4100000 },
];

const TRANSACTIONS = [
  { id: "TRX-8942", date: "24/03/2026 - 14:30", course: "Fullstack Next.js Masterclass", amount: "899.000đ", fee: "89.900đ", net: "809.100đ", status: "completed" },
  { id: "TRX-8941", date: "24/03/2026 - 11:15", course: "React Native cho người mới", amount: "499.000đ", fee: "49.900đ", net: "449.100đ", status: "completed" },
  { id: "TRX-8940", date: "23/03/2026 - 09:45", course: "Fullstack Next.js Masterclass", amount: "899.000đ", fee: "89.900đ", net: "809.100đ", status: "completed" },
  { id: "TRX-8939", date: "22/03/2026 - 18:20", course: "React Native cho người mới", amount: "499.000đ", fee: "49.900đ", net: "449.100đ", status: "refunded" },
  { id: "TRX-8938", date: "21/03/2026 - 21:05", course: "Fullstack Next.js Masterclass", amount: "899.000đ", fee: "89.900đ", net: "809.100đ", status: "completed" },
];

export default function InstructorRevenue() {
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
          <Button className="font-bold flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-none">
            <Wallet className="w-4 h-4" />
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
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/20 shadow-none border-none">
                Sẵn sàng rút
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">Số dư khả dụng</p>
              <h2 className="text-3xl font-black text-white">12.450.000đ</h2>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-green-700 bg-green-50">
                <ArrowUpRight className="w-3 h-3" />
                +15.3%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Doanh thu dự kiến tháng này</p>
              <h2 className="text-3xl font-black text-slate-900">24.500.000đ</h2>
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
              <h2 className="text-3xl font-black text-slate-900">145.890.000đ</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
           <div>
              <CardTitle className="text-lg font-bold">Thống Kê Doanh Thu</CardTitle>
              <CardDescription>Dòng tiền biến động trong 30 ngày qua</CardDescription>
           </div>
           <BarChartIcon className="w-5 h-5 text-slate-400" />
        </CardHeader>
        <CardContent className="h-[320px] pt-4">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_BY_DAY}>
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
                   tickFormatter={(value) => `${value/1000000}Tr`}
                 />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                 />
                 <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40}>
                    {REVENUE_BY_DAY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === REVENUE_BY_DAY.length - 1 ? '#15803d' : '#22c55e'} opacity={0.8} />
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
            Tháng 03/2026
          </div>
        </CardHeader>
        <div className="overflow-x-auto bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700">Mã GD & Thời gian</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Khóa học</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Giá bán</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Phí nền tảng (10%)</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thực nhận</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRANSACTIONS.map((trx) => (
                <TableRow key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{trx.id}</span>
                      <span className="text-xs text-slate-500">{trx.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700">
                    {trx.course}
                  </TableCell>
                  <TableCell className="text-right text-slate-600 font-medium">
                    {trx.amount}
                  </TableCell>
                  <TableCell className="text-right text-red-500 font-medium">
                    -{trx.fee}
                  </TableCell>
                  <TableCell className="text-right font-black text-green-600">
                    +{trx.net}
                  </TableCell>
                  <TableCell className="text-right">
                    {trx.status === "completed" && <Badge className="bg-green-100 text-green-700 shadow-none hover:bg-green-100">Thành công</Badge>}
                    {trx.status === "refunded" && <Badge className="bg-slate-100 text-slate-600 shadow-none hover:bg-slate-100 line-through">Hoàn tiền</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-slate-100 text-center">
          <Button variant="link" className="text-green-600 hover:text-green-700 font-bold">
            Xem toàn bộ lịch sử giao dịch &rarr;
          </Button>
        </div>
      </Card>
    </div>
  );
}

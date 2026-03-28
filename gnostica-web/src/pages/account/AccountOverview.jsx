import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  ShoppingBag,
  Star,
  Ticket,
  ChevronRight,
  Heart,
  MapPin,
} from "lucide-react";

const STATS = [
  { label: "Đơn hàng", value: "0", icon: ShoppingBag, color: "text-orange-500 bg-orange-50" },
  { label: "Điểm tích lũy", value: "350", icon: Star, color: "text-amber-500 bg-amber-50" },
  { label: "Kho Voucher", value: "6", icon: Ticket, color: "text-red-500 bg-red-50" },
];

const MOCK_FAVORITES = [
  {
    id: 1,
    title: "Fullstack Next.js Masterclass",
    price: "899.000đ",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Ultimate React Query Course",
    price: "499.000đ",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Docker & Kubernetes Bootcamp",
    price: "749.000đ",
    image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=200&auto=format&fit=crop",
  },
];

export default function AccountOverview() {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Tài khoản</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Tổng quan</h1>
        <span className="text-xs text-muted-foreground">Cập nhật lần cuối: 24/03/2026</span>
      </div>

      {/* Welcome Banner */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-slate-800 to-slate-700 text-white mb-6 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Xin chào, Minh Lê! 👋
          </h2>
          <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-lg">
            Chào mừng trở lại TechOne. Khám phá các ưu đãi mới nhất và quản lý đơn hàng của bạn một cách dễ dàng.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="border-slate-100 shadow-sm mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold text-slate-900">Đơn hàng gần đây</CardTitle>
          <Link to="/account/orders" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 py-3">Mã đơn</TableHead>
                <TableHead className="font-bold text-slate-700 py-3">Ngày đặt</TableHead>
                <TableHead className="font-bold text-slate-700 py-3">Sản phẩm</TableHead>
                <TableHead className="font-bold text-slate-700 py-3">Tổng tiền</TableHead>
                <TableHead className="font-bold text-slate-700 py-3">Trạng thái</TableHead>
                <TableHead className="font-bold text-slate-700 py-3 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ShoppingBag className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-medium">Chưa có đơn hàng nào</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
            <p className="text-xs text-muted-foreground">
              Đang xem <span className="font-bold text-slate-700">1</span> đến{" "}
              <span className="font-bold text-slate-700">6</span> trong tổng số{" "}
              <span className="font-bold text-slate-700">6</span> mục
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Xem</span>
                <Select defaultValue="10">
                  <SelectTrigger className="h-8 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>mục</span>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" className="h-8 w-8 p-0" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive className="h-8 w-8">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" className="h-8 w-8 p-0" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row: Favorites + Default Address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorites */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Sản phẩm yêu thích</CardTitle>
            <Link to="/account/wishlist" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              {MOCK_FAVORITES.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-primary font-bold">{item.price}</p>
                  </div>
                  <Heart className="w-4 h-4 text-red-400 fill-red-400 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Default Address */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Địa chỉ mặc định</CardTitle>
            <Link to="/account/addresses" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              Chỉnh sửa <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-slate-800">Minh Lê</span>
                <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0 hover:bg-primary/10">
                  Mặc định
                </Badge>
              </div>
              <p className="text-sm text-slate-600">0912 345 678</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

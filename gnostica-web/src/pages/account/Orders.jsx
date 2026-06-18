import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
import { Home, ShoppingBag, Eye, Download } from "lucide-react";

// Mock Data
const ORDERS_DATA = [
  {
    id: "DH-10294",
    date: "15/03/2026",
    courses: ["Thiết kế UI/UX Thực chiến với Figma"],
    total: "899.000đ",
    method: "VNPay",
    status: "Thành công",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "DH-10182",
    date: "10/01/2026",
    courses: ["Lập trình Web Frontend Bootcamp 2026", "Mastering React 18"],
    total: "1.299.000đ",
    method: "Thẻ tín dụng",
    status: "Thành công",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "DH-09871",
    date: "25/12/2025",
    courses: ["Docker & Kubernetes Bootcamp"],
    total: "749.000đ",
    method: "Momo",
    status: "Đã hủy",
    statusColor: "bg-error/10 text-error text-error",
  },
];

export default function Orders() {
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
            <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tài khoản
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Lịch sử đơn hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-primary" />
            Lịch sử mua hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các giao dịch và đăng ký khóa học của bạn.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/80">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-bold text-foreground py-4 whitespace-nowrap">Mã đơn hàng</TableHead>
                  <TableHead className="font-bold text-foreground py-4 whitespace-nowrap">Ngày đặt</TableHead>
                  <TableHead className="font-bold text-foreground py-4 w-[300px]">Sản phẩm</TableHead>
                  <TableHead className="font-bold text-foreground py-4 whitespace-nowrap">Tổng tiền</TableHead>
                  <TableHead className="font-bold text-foreground py-4 whitespace-nowrap">PT Thanh toán</TableHead>
                  <TableHead className="font-bold text-foreground py-4 whitespace-nowrap">Trạng thái</TableHead>
                  <TableHead className="font-bold text-foreground py-4 text-right whitespace-nowrap">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS_DATA.length > 0 ? (
                  ORDERS_DATA.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-muted transition-colors">
                      <TableCell className="font-mono font-semibold text-foreground py-4">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium py-4">
                        {order.date}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          {order.courses.map((course, idx) => (
                            <p key={idx} className="text-sm font-bold text-foreground line-clamp-1">
                              • {course}
                            </p>
                          ))}
                        </div>
                        {order.courses.length > 1 && (
                          <span className="text-xs text-primary font-bold mt-1 inline-block">
                            +{order.courses.length - 1} khóa học khác
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-black text-primary py-4">
                        {order.total}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium py-4">
                        {order.method}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${order.statusColor} hover:${order.statusColor} border-none shadow-none font-bold px-2.5 py-1`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-info hover:bg-blue-50 rounded-lg transition-colors" title="Tải hóa đơn">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">Bạn chưa có đơn hàng nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between px-2 py-4 mt-2">
        <p className="text-sm text-muted-foreground font-medium">Hiển thị {ORDERS_DATA.length} đơn hàng</p>
      </div>
    </div>
  );
}

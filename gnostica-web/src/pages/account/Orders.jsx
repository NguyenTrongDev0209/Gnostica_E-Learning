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
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { ShoppingBag, Eye, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useOrders from "@/hooks/account/useOrders";
import { AppButton } from "@/components/common/micro/AppButton";

export default function Orders() {
  const { orders, loading } = useOrders();

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Lịch sử đơn hàng" }]} />

      <AppPageHeader
        icon={ShoppingBag}
        title="Lịch sử mua hàng"
        description="Quản lý các giao dịch và đăng ký khóa học của bạn."
      />

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
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></div></TableCell>
                    </TableRow>
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
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
                          <AppButton appVariant="ghostMuted" variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Xem chi tiết">
                            <Eye className="w-5 h-5" />
                          </AppButton>
                          <AppButton appVariant="ghostMuted" variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:text-info hover:bg-blue-50" title="Tải hóa đơn">
                            <Download className="w-5 h-5" />
                          </AppButton>
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
        <p className="text-sm text-muted-foreground font-medium">Hiển thị {orders.length} đơn hàng</p>
      </div>
    </div>
  );
}

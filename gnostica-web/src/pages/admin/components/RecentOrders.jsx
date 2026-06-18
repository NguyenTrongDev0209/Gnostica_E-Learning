import React from "react";
import { Link } from "react-router-dom";
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

export default function RecentOrders({ orders }) {
    return (
        <Card className="border-border shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                <div>
                    <CardTitle className="text-lg font-bold text-foreground">Đơn Hàng Gần Đây</CardTitle>
                    <CardDescription>Giao dịch thực tế qua hệ thống</CardDescription>
                </div>
                <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">
                    Xem tất cả
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[340px]">
                <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10 shadow-sm">
                        <TableRow className="border-b border-border">
                            <TableHead className="py-3 font-semibold text-foreground">Mã đơn</TableHead>
                            <TableHead className="py-3 font-semibold text-foreground">Khách hàng</TableHead>
                            <TableHead className="py-3 font-semibold text-foreground">Khóa học</TableHead>
                            <TableHead className="py-3 font-semibold text-foreground text-right">Giá trị</TableHead>
                            <TableHead className="py-3 font-semibold text-foreground text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted border-b border-border last:border-none">
                                    <TableCell className="font-medium text-foreground py-3">{order.id}</TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{order.user}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">{order.date}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-[150px] py-3">
                                        {order.course}
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground text-right py-3">
                                        {order.price.toLocaleString()}đ
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        {order.status === "completed" && <Badge className="bg-success/10 text-success text-success hover:bg-success/10 text-success shadow-none border-success/20">Hoàn thành</Badge>}
                                        {order.status === "pending" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-amber-200">Chờ xử lý</Badge>}
                                        {order.status === "failed" && <Badge className="bg-error/10 text-error text-error hover:bg-error/10 text-error shadow-none border-error/20">Thất bại</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Chưa có đơn hàng nào
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

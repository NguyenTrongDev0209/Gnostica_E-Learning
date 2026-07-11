import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AppTable from "@/components/common/composite/AppTable";
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
                <AppTable
                    columns={[
                        {
                            header: "Mã đơn",
                            cellClassName: "font-medium text-foreground py-3",
                            render: (order) => order.id,
                        },
                        {
                            header: "Khách hàng",
                            cellClassName: "py-3",
                            render: (order) => (
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{order.user}</span>
                                    <span className="text-xs text-muted-foreground mt-0.5">{order.date}</span>
                                </div>
                            ),
                        },
                        {
                            header: "Khóa học",
                            cellClassName: "text-sm text-muted-foreground truncate max-w-[150px] py-3",
                            render: (order) => order.course,
                        },
                        {
                            header: "Giá trị",
                            className: "text-right",
                            cellClassName: "font-bold text-foreground text-right py-3",
                            render: (order) => `${order.price.toLocaleString()}đ`,
                        },
                        {
                            header: "Trạng thái",
                            className: "text-center",
                            cellClassName: "text-center py-3",
                            render: (order) => (
                                <>
                                    {order.status === "completed" && <Badge className="bg-success/10 text-success text-success hover:bg-success/10 text-success shadow-none border-success/20">Hoàn thành</Badge>}
                                    {order.status === "pending" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-amber-200">Chờ xử lý</Badge>}
                                    {order.status === "failed" && <Badge className="bg-error/10 text-error text-error hover:bg-error/10 text-error shadow-none border-error/20">Thất bại</Badge>}
                                </>
                            ),
                        },
                    ]}
                    data={orders || []}
                    emptyState="Chưa có đơn hàng nào"
                    disablePagination={true}
                />
            </CardContent>
        </Card>
    );
}

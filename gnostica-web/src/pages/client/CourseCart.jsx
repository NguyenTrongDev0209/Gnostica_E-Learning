import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Gift,
  Tag
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleButton } from "@/components/common/AppButton";
import { AppBreadcrumb, PageHeader } from "@/components/common/AppSection";
import CartItemTableRow from "@/components/common/CartItemTableRow";
import { Home } from "lucide-react";
import { cartItemsMock } from "@/mocks/cart";

export default function CourseCart() {
  const [cart, setCart] = useState(cartItemsMock);
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(cart.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleRemove = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    setSelectedIds(prev => prev.filter(itemId => itemId !== id));
  };

  const currentSubtotal = cart
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + parseInt(item.price.toString().replace(/\./g, '')), 0);

  const currentOriginalTotal = cart
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + parseInt(item.originalPrice.toString().replace(/\./g, '')), 0);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Giỏ hàng", isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      {/* 2. Main Content Area */}
      <main className="app-container">
        <div className="mb-0">
          <AppBreadcrumb
            items={breadcrumbItems}
            linkClassName="text-slate-400 hover:text-primary"
            activeClassName="font-semibold text-slate-900"
            separatorClassName="text-slate-300"
          />
          <PageHeader
            title="Giỏ hàng của bạn"
            description={`Bạn đang có ${cart.length} khóa học tuyệt vời trong giỏ hàng`}
            className="mt-4"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8">
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm px-3">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] py-4">
                      <Checkbox
                        id="select-all"
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead colSpan={2} className="font-bold text-slate-900 py-4">
                      <div className="flex items-center">
                        <div className="w-[96px] md:w-[128px]" />
                        <div className="px-4">Khóa học</div>
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px] font-bold text-slate-900 py-4 text-center">Số lượng</TableHead>
                    <TableHead className="w-[80px] text-right font-bold text-slate-900 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <CartItemTableRow
                        key={item.id}
                        item={item}
                        onRemove={handleRemove}
                        isSelected={selectedIds.includes(item.id)}
                        onSelect={handleSelectItem}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                          <ShoppingBag className="w-16 h-16 opacity-20" />
                          <p className="font-medium">Giỏ hàng rỗng</p>
                          <Link to="/courses">
                            <SimpleButton>Khám phá khóa học ngay</SimpleButton>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Tiếp tục chọn khóa học
                </Link>
              </div>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Thanh toán bảo mật</p>
                  <p className="text-slate-500">100% an toàn & bảo mật</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Trả phí một lần</p>
                  <p className="text-slate-500">Truy cập trọn đời khóa học</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Mã ưu đãi</p>
                  <p className="text-slate-500">Dùng mã để được giảm giá</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-10 space-y-6">
              <Card className="border-none shadow-2xl shadow-orange-500/10 overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5">
                  <CardTitle className="text-xl font-bold text-slate-900 text-center uppercase tracking-tight">Xác nhận đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="px-8 py-6 space-y-4">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Giá gốc:</span>
                    <span className="line-through">{currentOriginalTotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Giảm giá:</span>
                    <span className="text-red-500">-{(currentOriginalTotal - currentSubtotal).toLocaleString()}đ</span>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-slate-900">Tổng cộng:</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gradient-button font-extrabold leading-none">
                        {currentSubtotal.toLocaleString()}đ
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 px-0.5">đã bao gồm thuế</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="relative mb-3">
                      <Input
                        placeholder="Nhập mã giảm giá..."
                        className="pr-20 h-11 border-slate-200 focus-visible:ring-primary focus-visible:border-primary"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 bottom-1 h-auto px-4 text-primary font-bold hover:bg-primary/5 active:scale-95"
                      >
                        Áp dụng
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Tag className="w-3 h-3" />
                      <span>Các thẻ quà tặng hiện có sẽ được áp dụng khi thanh toán</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-6 flex flex-col gap-4">
                  <Link to="/checkout" className="mx-auto">
                    <SimpleButton className="w-fit py-7 px-16 text-lg font-bold tracking-wide gap-2 flex" size="lg">
                      THANH TOÁN NGAY
                    </SimpleButton>
                  </Link>
                </CardFooter>
              </Card>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[11px] text-center font-bold text-primary italic">
                  * Khóa học của bạn sẽ được kích hoạt ngay sau khi thanh toán thành công
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

import React from "react";
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
import { SimpleButton } from "@/components/common/AppButton";
import { AppBreadcrumb } from "@/components/common/AppSection";
import { Home } from "lucide-react";

// Dummy cart data
const cartItems = [
  {
    id: 1,
    title: "Fullstack Next.js Masterclass",
    instructor: "Sonny Sangha",
    price: "899.000",
    originalPrice: "1.799.000",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop",
    rating: 5.0
  },
  {
    id: 2,
    title: "Ultimate React Query Course",
    instructor: "Maximilian Schwarzmüller",
    price: "499.000",
    originalPrice: "999.000",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=200&auto=format&fit=crop",
    rating: 4.8
  }
];

export default function CourseCart() {
  const subtotal = 1398000; // 899000 + 499000
  const totalOriginal = 2798000;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Giỏ hàng của bạn", isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Header Section */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb 
            items={breadcrumbItems} 
            linkClassName="text-slate-400 hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-slate-500"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Giỏ hàng
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Bạn có {cartItems.length} khóa học trong giỏ hàng</p>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="app-container mt-[-40px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Cart Items Table */}
          <div className="lg:col-span-8">
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[400px] font-bold text-slate-900 py-4">Khóa học</TableHead>
                    <TableHead className="font-bold text-slate-900 py-4">Giá tiền</TableHead>
                    <TableHead className="text-right font-bold text-slate-900 py-4">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="py-6">
                          <div className="flex gap-4">
                            <div className="w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-lg overflow-hidden border border-slate-100 shadow-sm relative group">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {item.title}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium italic">Bởi {item.instructor}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-bold text-yellow-500">{item.rating}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < Math.floor(item.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-black text-primary text-lg">
                              {item.price}đ
                            </div>
                            <div className="text-xs text-slate-400 line-through">
                              {item.originalPrice}đ
                            </div>
                            <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 bg-red-50 font-bold px-1.5 py-0">
                              TIẾT KIỆM 50%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-64 text-center">
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

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              <Card className="border-none shadow-2xl shadow-orange-500/10 overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg font-bold text-slate-900">Tổng kết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Giá gốc:</span>
                    <span className="line-through">{totalOriginal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Giảm giá:</span>
                    <span className="text-red-500">-{ (totalOriginal - subtotal).toLocaleString() }đ</span>
                  </div>
                  
                  <Separator className="bg-slate-100" />
                  
                  <div className="flex justify-between items-end pt-2">
                    <span className="font-bold text-slate-900">Tổng cộng:</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-primary leading-none">
                        {subtotal.toLocaleString()}đ
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">đã bao gồm thuế</p>
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
                <CardFooter className="p-6 pt-0">
                  <SimpleButton className="w-full py-7 text-lg font-black tracking-wide" size="lg">
                    THANH TOÁN NGAY
                  </SimpleButton>
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

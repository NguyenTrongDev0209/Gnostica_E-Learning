import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Tag,
  Trash2,
  Calendar,
  Ticket,
  Users,
  Percent,
  CircleDollarSign,
  Package,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import couponService from "@/services/couponService";
import authService from "@/services/authService";
import { format } from "date-fns";

const couponSchema = z.object({
  name: z.string().min(1, "Tên phiếu không được để trống"),
  code: z
    .string()
    .min(3, "Mã giảm giá phải có ít nhất 3 ký tự")
    .max(50, "Mã giảm giá không vượt quá 50 ký tự")
    .toUpperCase(),
  discountPercent: z.coerce
    .number()
    .min(1, "Giảm giá tối thiểu là 1%")
    .max(100, "Giảm giá tối đa là 100%"),
  minDiscount: z.coerce.number().min(0, "Giá trị tối thiểu không được âm"),
  maxDiscount: z.coerce.number().min(0, "Giá trị tối đa không được âm"),
  startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
  expiryDate: z.string().min(1, "Ngày hết hạn không được để trống"),
  quantity: z.coerce.number().min(0, "Số lượng không được âm"),
});

// Helper functions for Vietnamese number formatting
const formatVNNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const stringValue = value.toString();
  const parts = stringValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
};

const parseVNNumber = (value) => {
  if (typeof value !== "string") return value;
  // Convert Vietnamese format (1.000,5) to standard computer format (1000.5)
  const clean = value.replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(clean);
  return isNaN(num) ? "" : num;
};

const formatPercentValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return `${value}%`;
};

const parsePercentValue = (value) => {
  if (typeof value !== "string") return value;
  const clean = value.replace(/%/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? "" : num;
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = authService.getCurrentUser();

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await couponService.getCoupons();
      if (response && response.data) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountPercent: 10,
      minDiscount: 0,
      maxDiscount: 0,
      startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      expiryDate: "",
      quantity: 100,
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
      };

      await couponService.createCoupon(payload);
      toast.success("Thêm mã giảm giá thành công!");
      setIsAddModalOpen(false);
      form.reset();
      fetchCoupons();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Có lỗi xảy ra khi tạo mã giảm giá.";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;

    try {
      await couponService.deleteCoupon(id);
      toast.success("Xóa mã giảm giá thành công!");
      fetchCoupons();
    } catch (error) {
      toast.error("Không thể xóa mã giảm giá");
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <style>{`
        /* Hide spin-buttons for Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Hide spin-buttons for Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Quản lý Mã giảm giá
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tạo và quản lý các chương trình ưu đãi cho học viên.
          </p>
        </div>
        <Button
          className="font-bold flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Phiếu giảm
        </Button>
      </div>

      {/* Filter & Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm mã giảm giá..."
                className="pl-9 h-10 border-slate-200 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số mã</p>
            <p className="text-2xl font-bold text-primary">{coupons.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[60px]">STT</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Tên phiếu</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Mã phiếu</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Giá trị giảm</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Điều kiện</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[220px]">Thời gian</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Số lượng</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-slate-500 font-medium">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ticket className="w-12 h-12 opacity-20" />
                      <p>Không tìm thấy mã giảm giá nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon, index) => (
                  <TableRow key={coupon.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-slate-900">{coupon.name}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold text-primary border border-slate-200">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-primary">-{coupon.discountPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left py-4 pl-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-slate-600">
                          <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Min:</span>
                          <span className="font-medium text-slate-900">{coupon.minDiscount?.toLocaleString()}đ</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Max:</span>
                          <span className="font-medium text-slate-900">{coupon.maxDiscount?.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      <div className="flex flex-col items-center">
                      <div className="w-fit text-left space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] uppercase font-bold opacity-50 w-8">Từ:</span>
                          <span className="text-xs">{coupon.startDate ? format(new Date(coupon.startDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] uppercase font-bold opacity-50 w-8">Đến:</span>
                          <span className="text-xs">{coupon.expiryDate ? format(new Date(coupon.expiryDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium px-2 py-0.5 rounded text-xs ${coupon.quantity === 0 ? "bg-green-100 text-green-700 font-bold" : "bg-slate-100 text-slate-700"}`}>
                        {coupon.quantity === 0 ? "Vô hạn" : coupon.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {coupon.status === 0 && <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Tạm ẩn</Badge>}
                      {coupon.status === 1 && <Badge variant="success" className="bg-green-100 text-green-600 border-green-200">Hoạt động</Badge>}
                      {coupon.status === 2 && <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200">Hết hạn</Badge>}
                      {coupon.status === 3 && <Badge variant="warning" className="bg-orange-100 text-orange-600 border-orange-200">Hết lượt</Badge>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Coupon Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Tạo mã Phiếu giảm giá
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> Tên phiếu giảm giá
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập tên chương trình giảm giá..."
                          className="h-11 border-slate-200 bg-white"
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> Mã giảm giá (VD: GS2024)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="NHẬP MÃ TẠI ĐÂY"
                          className="h-11 border-slate-200 bg-white font-bold tracking-widest uppercase focus-visible:ring-primary"
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="w-4 h-4" /> Phần trăm giảm
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="h-11 border-slate-200 bg-white"
                          value={formatPercentValue(field.value)}
                          onChange={(e) => {
                            const val = parsePercentValue(e.target.value);
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Số lượng
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="h-11 border-slate-200 bg-white"
                          value={formatVNNumber(field.value)}
                          onChange={(e) => field.onChange(parseVNNumber(e.target.value))}
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4" /> Giảm tối thiểu (đ)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="h-11 border-slate-200 bg-white"
                          value={formatVNNumber(field.value)}
                          onChange={(e) => field.onChange(parseVNNumber(e.target.value))}
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4" /> Giảm tối đa (đ)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="h-11 border-slate-200 bg-white"
                          value={formatVNNumber(field.value)}
                          onChange={(e) => field.onChange(parseVNNumber(e.target.value))}
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Ngày bắt đầu
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="h-11 border-slate-200 bg-white"
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Ngày hết hạn
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="h-11 border-slate-200 bg-white"
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage className="text-[11px]" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 border-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-primary px-8 font-bold">
                  Tạo mã ngay
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

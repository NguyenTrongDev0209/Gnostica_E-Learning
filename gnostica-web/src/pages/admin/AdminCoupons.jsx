import React, { useState } from "react";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import { Ticket, Plus, Search, Calendar, Percent, Copy, Edit, BarChart, Trash2, Package, CircleDollarSign } from "lucide-react";
import { useCoupons } from "@/hooks/order/useCoupons";

export default function AdminCoupons() {
  const { coupons, isLoading, addCoupon, removeCoupon, toggleCouponStatus } = useCoupons();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = coupon.status === Number(statusFilter);
    }

    let matchesStartDate = true;
    if (startDateFilter && coupon.startDate) {
      const filterStart = new Date(startDateFilter);
      filterStart.setHours(0, 0, 0, 0);
      matchesStartDate = new Date(coupon.startDate) >= filterStart;
    }

    let matchesEndDate = true;
    if (endDateFilter && coupon.startDate) {
      const filterEnd = new Date(endDateFilter);
      filterEnd.setHours(23, 59, 59, 999);
      matchesEndDate = new Date(coupon.startDate) <= filterEnd;
    }

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

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

      <CouponHeader onAddClick={() => setIsAddModalOpen(true)} />

      <CouponStatsFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        startDateFilter={startDateFilter}
        onStartDateChange={setStartDateFilter}
        endDateFilter={endDateFilter}
        onEndDateChange={setEndDateFilter}
        totalCount={coupons.length}
      />

      <CouponTable
        coupons={filteredCoupons}
        isLoading={isLoading}
        onDelete={removeCoupon}
        onToggleStatus={toggleCouponStatus}
      />

      <CouponFormModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={addCoupon}
      />
    </div>
  );
}


function CouponHeader({ onAddClick }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Ticket className="w-6 h-6 text-primary" />
          Quản lý Mã giảm giá
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tạo và quản lý các chương trình ưu đãi cho học viên.
        </p>
      </div>
      <AppButton appVariant="gradient"
        className="flex items-center gap-2"
        onClick={onAddClick}
      >
        <Plus className="w-4 h-4" />
        Thêm Phiếu giảm
      </AppButton>
    </div>
  );
}

function CouponStatsFilter({ 
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
  startDateFilter, onStartDateChange,
  endDateFilter, onEndDateChange,
  totalCount 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard appVariant="default" className="md:col-span-3 border-border shadow-sm">
        <AppCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã giảm giá..."
                className="pl-9 h-10 border-border focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[180px] flex-shrink-0">
              <AppSelect 
                value={statusFilter} 
                onValueChange={onStatusChange}
                placeholder="Trạng thái"
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Hoạt động", value: "1" },
                  { label: "Tạm ẩn", value: "0" },
                  { label: "Hết hạn", value: "2" },
                  { label: "Hết lượt", value: "3" }
                ]}
              />
            </div>

            <div className="w-full md:w-[140px]">
              <Input
                type="date"
                className="h-10 border-border focus:bg-white text-muted-foreground"
                value={startDateFilter}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            
            <div className="hidden md:flex items-center text-slate-300">-</div>

            <div className="w-full md:w-[140px]">
              <Input
                type="date"
                className="h-10 border-border focus:bg-white text-muted-foreground"
                value={endDateFilter}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </AppCardContent>
      </AppCard>
      <AppCard appVariant="default" className="border-border shadow-sm bg-muted">
        <AppCardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng số mã</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </AppCardContent>
      </AppCard>
    </div>
  );
}

function CouponTable({ coupons, isLoading, onDelete, onToggleStatus }) {
  return (
    <AppCard appVariant="default" className="border-border shadow-sm overflow-hidden">
      <div className="px-4 pb-2">
        <DataTable
          columns={[
            {
              header: "STT",
              width: "50px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (_, index) => index + 1,
            },
            {
              header: "Tên phiếu",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => <span className="font-bold text-foreground">{coupon.name}</span>,
            },
            {
              header: "Mã phiếu",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => (
                <div className="flex flex-col items-center">
                  <AppButton appVariant="ghostMuted" variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      toast.success(`Đã sao chép mã: ${coupon.code}`);
                    }}
                    title="Nhấn để sao chép"
                    className="group flex flex-row items-center gap-1.5 bg-secondary hover:bg-muted/70 px-2 py-1 rounded border border-border hover:border-border transition-colors h-auto"
                  >
                    <span className="text-xs font-mono font-bold text-primary">
                      {coupon.code}
                    </span>
                    <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </AppButton>
                </div>
              ),
            },
            {
              header: "Giá trị giảm",
              width: "100px",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => (
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-primary">-{coupon.discountPercent}%</span>
                </div>
              ),
            },
            {
              header: "Điều kiện",
              width: "140px",
              className: "text-center",
              cellClassName: "text-left py-4 pl-6",
              render: (coupon) => (
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Min:</span>
                    <span className="font-medium text-foreground">{coupon.minDiscount?.toLocaleString()}đ</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Max:</span>
                    <span className="font-medium text-foreground">{coupon.maxDiscount?.toLocaleString()}đ</span>
                  </div>
                </div>
              ),
            },
            {
              header: "Thời gian",
              width: "220px",
              className: "text-center",
              cellClassName: "text-center text-sm",
              render: (coupon) => (
                <div className="flex flex-col items-center">
                  <div className="w-fit text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase font-bold opacity-50 w-8">Từ:</span>
                      <span className="text-xs">{coupon.startDate ? format(new Date(coupon.startDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase font-bold opacity-50 w-8">Đến:</span>
                      <span className="text-xs">{coupon.expiryDate ? format(new Date(coupon.expiryDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Số lượng",
              width: "200px",
              className: "text-center",
              cellClassName: "text-center w-[200px]",
              render: (coupon) => (
                coupon.quantity === 0 ? (
                  <span className="font-bold text-success bg-success/10 text-success px-2 py-0.5 rounded text-xs">Vô hạn</span>
                ) : (
                  <div className="flex flex-col gap-1 w-full max-w-[160px] mx-auto">
                    <div className="flex justify-between items-end text-[10px] text-muted-foreground font-medium px-1">
                      <span className="text-primary font-bold">0%</span>
                      <span>0 / {coupon.quantity.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                )
              ),
            },
            {
              header: "Trạng thái",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => (
                <>
                  {coupon.status === 0 && <AppBadge variant="secondary" className="border-border">Tạm ẩn</AppBadge>}
                  {coupon.status === 1 && <AppBadge variant="success" soft>Hoạt động</AppBadge>}
                  {coupon.status === 2 && <AppBadge variant="error" soft>Hết hạn</AppBadge>}
                  {coupon.status === 3 && <AppBadge variant="warning" soft>Hết lượt</AppBadge>}
                </>
              ),
            },
            {
              header: "Thao tác",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center w-[120px]",
              render: (coupon) => (
                <div className="flex items-center justify-center gap-1">
                  <TableActionIconButton
                    icon={Edit}
                    title="Đổi trạng thái"
                    onClick={() => onToggleStatus && onToggleStatus(coupon)}
                  />
                  <TableActionIconButton
                    icon={BarChart}
                    title="Xem biểu đồ"
                  />
                  <TableActionIconButton
                    icon={Trash2}
                    colorVariant="error"
                    title="Xóa mã"
                    onClick={() => onDelete(coupon.id)}
                  />
                </div>
              ),
            },
          ]}
          data={coupons}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <Ticket className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy mã giảm giá nào.</p>
            </div>
          }
        />
      </div>
    </AppCard>
  );
}

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

const formatVNNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const stringValue = value.toString();
  const parts = stringValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
};



function CouponFormModal({ isOpen, onOpenChange, onSave }) {
  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      name: "",
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
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      expiryDate: new Date(data.expiryDate).toISOString(),
    };
    const result = await onSave(payload);
    if (result && result.success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Tạo mã Phiếu giảm giá
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel className="flex items-center gap-2">
                      <Ticket className="w-4 h-4" /> Tên phiếu giảm giá
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên chương trình giảm giá..."
                        className="h-11 border-border bg-white"
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
                        className="h-11 border-border bg-white font-bold tracking-widest uppercase"
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
                  <FormItem className="col-span-1">
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="w-4 h-4" /> Phần trăm giảm
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          className="h-11 border-border bg-white pr-8 text-right font-medium"
                          value={field.value}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(clean === '' ? 0 : Number(clean));
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                          %
                        </span>
                      </div>
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
                  <FormItem className="col-span-1">
                    <FormLabel className="flex items-center gap-2">
                      <Package className="w-4 h-4" /> Số lượng
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        className="h-11 border-border bg-white text-right font-medium"
                        value={formatVNNumber(field.value)}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(clean === '' ? 0 : Number(clean));
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
                name="minDiscount"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <CircleDollarSign className="w-4 h-4" /> Giảm tối thiểu
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          className="h-11 border-border bg-white pr-8 text-right font-medium"
                          value={formatVNNumber(field.value)}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(clean === '' ? 0 : Number(clean));
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                          đ
                        </span>
                      </div>
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
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <CircleDollarSign className="w-4 h-4" /> Giảm tối đa
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          className="h-11 border-border bg-white pr-8 text-right font-medium"
                          value={formatVNNumber(field.value)}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(clean === '' ? 0 : Number(clean));
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                          đ
                        </span>
                      </div>
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
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Ngày bắt đầu
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="h-11 border-border bg-white"
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
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Ngày hết hạn
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="h-11 border-border bg-white"
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
              <AppButton appVariant="ghostMuted" variant="ghost"
                type="button"
                onClick={() => form.reset()}
                className="px-6 border border-border"
              >
                Tạo lại
              </AppButton>
              <AppButton appVariant="gradient" type="submit" className="px-8 font-bold">
                Tạo mã ngay
              </AppButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
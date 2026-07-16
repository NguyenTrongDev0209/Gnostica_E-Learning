import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/common/micro/AppButton";
import { Ticket, Percent, CircleDollarSign, Package, Calendar } from "lucide-react";
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

const formatVNNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const stringValue = value.toString();
  const parts = stringValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
};



export function CouponFormModal({ isOpen, onOpenChange, onSave }) {
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
                        className="h-11 border-border bg-white font-bold tracking-widest uppercase focus-visible:ring-primary"
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

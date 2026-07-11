import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/common/micro/AppButton";
import { Building2, Hash, Image as ImageIcon, ToggleLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bankSchema = z.object({
  shortName: z.string().min(1, "Tên ngân hàng không được để trống"),
  bankCode: z.string().min(2, "Mã ngân hàng (Code) phải có ít nhất 2 ký tự").toUpperCase(),
  bin: z.string().min(6, "BIN phải có ít nhất 6 ký tự"),
  logoUrl: z.string().url("Logo URL không hợp lệ").or(z.string().length(0)),
  status: z.coerce.number(),
  externalId: z.coerce.number().optional(),
});

export function BankFormModal({ isOpen, onOpenChange, onSave, editingBank }) {
  const form = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      shortName: "",
      bankCode: "",
      bin: "",
      logoUrl: "",
      status: 1,
      externalId: 0,
    },
  });

  useEffect(() => {
    if (editingBank) {
      form.reset({
        shortName: editingBank.shortName || "",
        bankCode: editingBank.bankCode || "",
        bin: editingBank.bin || "",
        logoUrl: editingBank.logoUrl || "",
        status: editingBank.status ?? 1,
        externalId: editingBank.externalId || 0,
      });
    } else {
      form.reset({
        shortName: "",
        bankCode: "",
        bin: "",
        logoUrl: "",
        status: 1,
        externalId: 0,
      });
    }
  }, [editingBank, form, isOpen]);

  const onSubmit = async (data) => {
    const result = await onSave(data);
    if (result && result.success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {editingBank ? "Cập nhật Ngân hàng" : "Thêm Ngân hàng mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="shortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Tên hiển thị (Short Name)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Vietcombank, MBBank..."
                      className="h-10 border-border bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="w-4 h-4" /> Mã ngân hàng (Code)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: VCB, MB"
                        className="h-10 border-border bg-white uppercase font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="w-4 h-4" /> BIN (9704xx)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập mã BIN"
                        className="h-10 border-border bg-white"
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Link Logo
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://..."
                      className="h-10 border-border bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4" /> Trạng thái
                  </FormLabel>
                  <Select 
                    value={field.value.toString()} 
                    onValueChange={(val) => field.onChange(parseInt(val))}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 border-border bg-white">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[10000] bg-white border border-border shadow-md">
                      <SelectItem value="1">Đang hoạt động</SelectItem>
                      <SelectItem value="0">Tạm dừng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 gap-2">
              <AppButton appVariant="ghostMuted" variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-6 border border-border"
              >
                Hủy
              </AppButton>
              <AppButton appVariant="gradient" type="submit" className="px-8 font-bold">
                {editingBank ? "Cập nhật" : "Thêm mới"}
              </AppButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

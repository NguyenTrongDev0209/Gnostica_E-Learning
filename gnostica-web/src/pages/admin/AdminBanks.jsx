import React, { useState } from "react";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DataTable from "@/components/common/composite/DataTable";
import { TableActionIconButton } from "@/components/common/micro/AppButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { Plus, Search, Building2, RefreshCw, Edit, Trash2, Hash, ImageIcon, ToggleLeft } from "lucide-react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import { useBanks } from "@/hooks/payment/useBanks";

export default function AdminBanks() {
  const { banks, isLoading, addBank, updateBank, removeBank, syncBanks } = useBanks();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBanks = banks.filter((bank) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (bank.shortName?.toLowerCase().includes(searchStr)) ||
      (bank.bankCode?.toLowerCase().includes(searchStr)) ||
      (bank.bin?.toLowerCase().includes(searchStr));
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = bank.status === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanks = filteredBanks.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleAddClick = () => {
    setEditingBank(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (bank) => {
    setEditingBank(bank);
    setIsFormModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingBank) {
      return await updateBank(editingBank.id, data);
    } else {
      return await addBank(data);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <BankHeader 
        onAddClick={handleAddClick} 
        onSyncClick={syncBanks} 
        isSyncing={isLoading} 
      />
      
      <BankStatsFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={banks.length} 
      />
      
      <BankTable 
        banks={paginatedBanks} 
        isLoading={isLoading} 
        onEdit={handleEditClick}
        onDelete={removeBank} 
        startIndex={startIndex}
        pagination={{
          currentPage,
          totalPages,
          totalElements: filteredBanks.length,
          onPageChange: setCurrentPage,
          zeroIndexed: false,
        }}
      />


      <BankFormModal 
        isOpen={isFormModalOpen} 
        onOpenChange={setIsFormModalOpen} 
        onSave={handleSave} 
        editingBank={editingBank}
      />
    </div>
  );
}


function BankHeader({ onAddClick, onSyncClick, isSyncing }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Quản lý Ngân hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý danh sách ngân hàng hỗ trợ thanh toán và đồng bộ từ VietQR.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AppButton appVariant="ghostMuted" variant="ghost"
          className="font-bold flex items-center gap-2 border border-primary text-primary hover:bg-primary/5"
          onClick={onSyncClick}
          disabled={isSyncing}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Đồng bộ VietQR
        </AppButton>
        <AppButton appVariant="gradient"
          className="flex items-center gap-2"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" />
          Thêm Ngân hàng
        </AppButton>
      </div>
    </div>
  );
}

function BankStatsFilter({ 
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
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
                placeholder="Tìm kiếm ngân hàng (tên, mã, bin)..."
                className="pl-9 h-10 border-border focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[200px] flex-shrink-0">
              <AppSelect 
                value={statusFilter} 
                onValueChange={onStatusChange}
                placeholder="Trạng thái"
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Đang hoạt động", value: "1" },
                  { label: "Tạm dừng", value: "0" }
                ]}
              />
            </div>
          </div>
        </AppCardContent>
      </AppCard>
      <AppCard appVariant="default" className="border-border shadow-sm bg-muted">
        <AppCardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng ngân hàng</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </AppCardContent>
      </AppCard>
    </div>
  );
}

function BankTable({ banks, isLoading, onEdit, onDelete, startIndex = 0 }) {
  return (
    <DataTable
          columns={[
            {
              header: "STT",
              width: "60px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (_, index) => startIndex + index + 1,
            },
            {
              header: "Ngân hàng",
              width: "400px",
              className: "text-center",
              cellClassName: "text-left py-4",
              render: (bank) => (
                <div className="flex items-center gap-3">
                  {bank.logoUrl ? (
                    <img 
                      src={bank.logoUrl} 
                      alt={bank.shortName} 
                      className="w-28 h-16 object-contain rounded"
                    />
                  ) : (
                    <div className="w-28 h-16 rounded flex items-center justify-center bg-secondary">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground text-lg leading-tight">{bank.shortName}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold mt-1">ID: {bank.externalId}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Mã",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center",
              render: (bank) => (
                <code className="text-xs font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                  {bank.bankCode}
                </code>
              ),
            },
            {
              header: "BIN",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (bank) => bank.bin,
            },
            {
              header: "Trạng thái",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center",
              render: (bank) => (
                bank.status === 1 ? (
                  <AppBadge variant="success" soft>Hoạt động</AppBadge>
                ) : (
                  <AppBadge variant="secondary" className="border-border">Tạm dừng</AppBadge>
                )
              ),
            },
            {
              header: "Thao tác",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center",
              render: (bank) => (
                <div className="flex items-center justify-center gap-1">
                  <TableActionIconButton
                    icon={Edit}
                    title="Sửa"
                    onClick={() => onEdit(bank)}
                  />
                  <TableActionIconButton
                    icon={Trash2}
                    colorVariant="error"
                    title="Xóa"
                    onClick={() => onDelete(bank.id)}
                  />
                </div>
              ),
            },
          ]}
          data={banks}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <Building2 className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy ngân hàng nào.</p>
            </div>
          }
        />
  );
}

const bankSchema = z.object({
  shortName: z.string().min(1, "Tên ngân hàng không được để trống"),
  bankCode: z.string().min(2, "Mã ngân hàng (Code) phải có ít nhất 2 ký tự").toUpperCase(),
  bin: z.string().min(6, "BIN phải có ít nhất 6 ký tự"),
  logoUrl: z.string().url("Logo URL không hợp lệ").or(z.string().length(0)),
  status: z.coerce.number(),
  externalId: z.coerce.number().optional(),
});

function BankFormModal({ isOpen, onOpenChange, onSave, editingBank }) {
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
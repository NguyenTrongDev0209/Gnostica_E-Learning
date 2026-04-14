import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BankTable({ banks, isLoading, onEdit, onDelete, startIndex = 0 }) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto px-4 pb-2">
        <div className="rounded-t-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[60px]">STT</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[400px]">Ngân hàng</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[120px]">Mã</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[120px]">BIN</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[150px]">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : banks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-12 h-12 opacity-20" />
                      <p>Không tìm thấy ngân hàng nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                banks.map((bank, index) => (
                  <TableRow key={bank.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium text-slate-500">{startIndex + index + 1}</TableCell>
                    <TableCell className="text-left py-4">
                      <div className="flex items-center gap-3">
                        {bank.logoUrl ? (
                          <img 
                            src={bank.logoUrl} 
                            alt={bank.shortName} 
                            className="w-28 h-16 object-contain rounded"
                          />
                        ) : (
                          <div className="w-28 h-16 rounded flex items-center justify-center bg-slate-100">
                            <Building2 className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-lg leading-tight">{bank.shortName}</p>
                          <p className="text-xs text-slate-500 uppercase font-bold mt-1">ID: {bank.externalId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <code className="text-xs font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                        {bank.bankCode}
                      </code>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-600">
                      {bank.bin}
                    </TableCell>
                    <TableCell className="text-center">
                      {bank.status === 1 ? (
                        <Badge variant="success" className="bg-green-100 text-green-600 border-green-200">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Tạm dừng</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Sửa"
                          onClick={() => onEdit(bank)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          title="Xóa"
                          onClick={() => onDelete(bank.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}

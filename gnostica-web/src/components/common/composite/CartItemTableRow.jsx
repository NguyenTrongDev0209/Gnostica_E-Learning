import React, { useState } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { AppButton } from "@/components/common/micro/AppButton";
import { AppCheckbox } from "@/components/common/micro/AppCheckbox";
import { Trash2, Plus, Minus, Star } from "lucide-react";

export default function CartItemTableRow({ item, onRemove, isSelected, onSelect }) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <TableRow className="group hover:bg-muted transition-colors">
      {/* Cột 1: Checkbox */}
      <TableCell className="py-6">
        <AppCheckbox 
          id={`item-${item.id}`} 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect && onSelect(item.id, checked)}
        />
      </TableCell>

      {/* Cột 2 & 3: Hình ảnh & Thông tin (Gộp chung để giảm khoảng hở) */}
      <TableCell colSpan={2} className="py-6">
        <div className="flex items-start gap-4">
          <div className="w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-lg overflow-hidden border border-border shadow-sm relative group/img mt-1">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug text-base">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground font-medium italic">Giảng viên: {item.instructor}</p>
            
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? "text-warning fill-yellow-400" : "text-slate-200 fill-slate-100"}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-muted-foreground">({item.rating})</span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span className="font-black text-lg text-gradient-button font-extrabold">
                {item.price}đ
              </span>
              {item.originalPrice && (
                <span className="text-xs text-muted-foreground line-through font-medium">
                  {item.originalPrice}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Cột 4: Số lượng */}
      <TableCell className="py-6">
        <div className="flex items-center justify-center gap-1">
          <AppButton 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
            onClick={handleDecrement}
          >
            <Minus className="w-3 h-3" />
          </AppButton>
          <div className="w-10 text-center font-bold text-foreground">
            {quantity}
          </div>
          <AppButton 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
            onClick={handleIncrement}
          >
            <Plus className="w-3 h-3" />
          </AppButton>
        </div>
      </TableCell>

      {/* Cột 5: Xóa */}
      <TableCell className="py-6 text-right">
        <AppButton 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-error hover:bg-red-50 transition-all active:scale-90"
          onClick={() => onRemove && onRemove(item.id)}
        >
          <Trash2 className="w-5 h-5" />
        </AppButton>
      </TableCell>
    </TableRow>
  );
}

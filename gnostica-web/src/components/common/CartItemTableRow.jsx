import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function CartItemTableRow({ item, onRemove }) {
  return (
    <TableRow className="group hover:bg-slate-50/50 transition-colors">
      <TableCell className="py-6">
        <div className="flex gap-4">
          <div className="w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-lg overflow-hidden border border-slate-100 shadow-sm relative group/img">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
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
          onClick={() => onRemove && onRemove(item.id)}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

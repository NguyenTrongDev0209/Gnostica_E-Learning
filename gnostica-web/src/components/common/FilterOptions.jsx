import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const categories = [
  "Web Development",
  "UI/UX Design",
  "Data Science",
  "Mobile Dev",
  "Cyber Security",
  "Graphic Design",
  "Business",
  "Marketing",
];

const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export default function FilterOptions({ priceRange, onPriceRangeChange }) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLevels, setShowAllLevels] = useState(false);

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5);
  const displayedLevels = showAllLevels ? levels : levels.slice(0, 5);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <Card className="border shadow-sm bg-white z-10 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
      <CardHeader className="pb-3 border-b border-slate-100 mb-4">
        <CardTitle className="text-lg font-bold text-center">Lọc kết quả</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Category Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Danh mục</h4>
          <div className="flex flex-col gap-2.5">
            {displayedCategories.map((category) => (
              <div key={category} className="flex items-center gap-2 group cursor-pointer">
                <Checkbox id={category} className="border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                <Label htmlFor={category} className="text-sm text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors">
                  {category}
                </Label>
              </div>
            ))}
          </div>
          {categories.length > 5 && (
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-1 mt-1 w-full"
            >
              {showAllCategories ? (
                <><ChevronUp className="w-4 h-4" /> Thu gọn</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Xem thêm</>
              )}
            </button>
          )}
        </div>

        <Separator className="bg-slate-200" />

        {/* Level Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Trình độ</h4>
          <div className="flex flex-col gap-2.5">
            {displayedLevels.map((level) => (
              <div key={level} className="flex items-center gap-2 group cursor-pointer">
                <Checkbox id={level} className="border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                <Label htmlFor={level} className="text-sm text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors">
                  {level}
                </Label>
              </div>
            ))}
          </div>
          {levels.length > 5 && (
            <button 
              onClick={() => setShowAllLevels(!showAllLevels)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-1 mt-1 w-full"
            >
              {showAllLevels ? (
                <><ChevronUp className="w-4 h-4" /> Thu gọn</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Xem thêm</>
              )}
            </button>
          )}
        </div>

        <Separator className="bg-slate-200" />

        {/* Price Filter */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Mức giá</h4>
          </div>
          
          <div className="px-2 pt-2 pb-1">
            <Slider 
              defaultValue={[0, 2000000]} 
              max={2000000} 
              step={50000}
              value={priceRange}
              onValueChange={onPriceRangeChange}
              className="[&_[data-slot=slider-track]]:!h-1.5 [&_[data-slot=slider-thumb]]:!size-4 [&_[data-slot=slider-range]]:bg-orange-500 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm font-medium text-slate-700 mt-1">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>

          <div className="flex justify-center mt-2">
            <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 font-medium">Lọc kết quả</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

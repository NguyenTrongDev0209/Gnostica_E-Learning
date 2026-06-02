import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import courseService from "@/services/courseService";

const levels = [
  { label: "Tất cả trình độ", value: "all" },
  { label: "Người mới bắt đầu", value: "beginner" },
  { label: "Trung bình", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

export default function FilterOptions({ categories = [], selectedFilters = {}, onFilterChange }) {
  // Trạng thái đóng/mở danh mục cha
  const [expandedId, setExpandedId] = useState(null);

  // Lọc các danh mục có khóa học
  const categoryTree = categories
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories?.filter(sub => sub.courses > 0) || []
    }))
    .filter(cat => cat.courses > 0);

  const [activeLevels, setActiveLevels] = useState([]);

  useEffect(() => {
    courseService.getPublicLevels().then(data => {
      if (data) {
        // Normalize to lowercase for matching
        setActiveLevels(data.map(l => l?.toLowerCase()));
      }
    }).catch(err => console.error(err));
  }, []);

  const filteredLevels = levels.filter(
    l => l.value === "all" || activeLevels.includes(l.value)
  );

  // Tự động mở rộng danh mục cha nếu có danh mục con đang được chọn
  React.useEffect(() => {
    if (selectedFilters.categorySlug && categoryTree.length > 0) {
      const activeParent = categoryTree.find(p =>
        p.slug === selectedFilters.categorySlug ||
        p.subcategories?.some(c => c.slug === selectedFilters.categorySlug)
      );
      if (activeParent) setExpandedId(activeParent.id);
    }
  }, [selectedFilters.categorySlug, categoryTree]);

  return (
    <Card className="border shadow-sm bg-white z-10 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
      <CardHeader className="pb-3 border-b border-slate-100 mb-4">
        <CardTitle className="text-lg font-bold text-center uppercase tracking-tighter">Lọc kết quả</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">

        {/* Category Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Danh mục</h4>
          <RadioGroup
            value={selectedFilters.categorySlug || "all"}
            onValueChange={(val) => onFilterChange("categorySlug", val === "all" ? null : val)}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 group cursor-pointer py-1.5" onClick={() => setExpandedId(null)}>
              <RadioGroupItem value="all" id="cat-all" className="border-slate-300 text-orange-500 focus:ring-orange-500" />
              <Label htmlFor="cat-all" className="text-sm font-bold text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors">
                Tất cả danh mục
              </Label>
            </div>

            {categoryTree.map((parent) => {
              const isExpanded = expandedId === parent.id;
              const hasSub = parent.subcategories && parent.subcategories.length > 0;

              return (
                <React.Fragment key={parent.id}>
                  {/* Parent Category */}
                  <div
                    className="flex items-center justify-between group cursor-pointer py-1.5 border-t border-slate-50 mt-1"
                    onClick={() => setExpandedId(isExpanded ? null : parent.id)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value={parent.slug}
                        id={`cat-${parent.id}`}
                        className="border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                      <Label htmlFor={`cat-${parent.id}`} className="text-sm font-bold text-slate-700 group-hover:text-slate-900 cursor-pointer transition-colors">
                        {parent.name}
                      </Label>
                    </div>
                    {hasSub && (
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </div>

                  {/* Subcategories (Level 2) - Collapsible */}
                  {isExpanded && hasSub && (
                    <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {parent.subcategories.map(child => (
                        <div key={child.id} className="flex items-center gap-2 group cursor-pointer py-1 ml-6">
                          <RadioGroupItem
                            value={child.slug}
                            id={`cat-${child.id}`}
                            className="border-slate-300 text-orange-500 focus:ring-orange-500"
                          />
                          <Label htmlFor={`cat-${child.id}`} className="text-sm font-medium text-slate-500 group-hover:text-slate-900 cursor-pointer transition-colors">
                            {child.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </RadioGroup>
        </div>

        <Separator className="bg-slate-100" />

        {/* Level Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Trình độ</h4>
          <RadioGroup
            value={selectedFilters.level || "all"}
            onValueChange={(val) => onFilterChange("level", val)}
            className="flex flex-col gap-2.5"
          >
            {filteredLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-2 group cursor-pointer">
                <RadioGroupItem value={level.value} id={`level-${level.value}`} className="border-slate-300 text-orange-500 focus:ring-orange-500" />
                <Label htmlFor={`level-${level.value}`} className="text-sm font-medium text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors">
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator className="bg-slate-100" />

        <div className="pt-2">
          <button
            onClick={() => {
              onFilterChange("categoryId", null);
              onFilterChange("level", "all");
            }}
            className="w-full h-10 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase"
          >
            Xóa tất cả lọc
          </button>
        </div>

      </CardContent>
    </Card>
  );
}

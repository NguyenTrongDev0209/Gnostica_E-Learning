import React, { useState, useEffect, forwardRef, useId } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import courseService from "@/services/course/courseService";

// Micro components
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import AppCard, { AppCardHeader, AppCardTitle, AppCardContent } from "@/components/common/micro/AppCard";
import AppSeparator from "@/components/common/micro/AppSeparator";
import { AppRadioGroupItem } from "@/components/common/micro/AppRadioGroup";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AppCheckbox } from "@/components/common/micro/AppCheckbox";
import AppPopover, { AppPopoverContent, AppPopoverTrigger } from "@/components/common/micro/AppPopover";
import { Button } from "@/components/ui/button";
import AppCalendar from "@/components/common/micro/AppCalendar";
/**
 * Thanh tìm kiếm & lọc topbar
 */
export default function DataFilter({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filterValue,
  onFilterChange,
  filterPlaceholder = "Lọc",
  filterOptions = [],
  dateRange, // { from, to }
  onDateRangeChange,
  dateRangePlaceholder = "Từ ngày - Đến ngày",
  containerClassName = "",
}) {
  return (
    <div className={cn("flex flex-col xl:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm", containerClassName)}>
      <div className="flex-1 min-w-[250px]">
        <AppInput 
          icon={Search}
          placeholder={searchPlaceholder} 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          containerClassName="w-full"
        />
      </div>
      
      {filterOptions && filterOptions.length > 0 && (
        <div className="w-full xl:w-[200px]">
          <AppSelect 
            value={filterValue} 
            onValueChange={onFilterChange}
            placeholder={filterPlaceholder}
            options={filterOptions}
          />
        </div>
      )}

      {onDateRangeChange && (
        <div className="w-full xl:w-[320px]">
          <AppDateRangePicker 
            date={dateRange}
            onSelect={onDateRangeChange}
            placeholder={dateRangePlaceholder}
          />
        </div>
      )}
    </div>
  );
}

const levels = [
  { label: "Tất cả trình độ", value: "all" },
  { label: "Người mới bắt đầu", value: "beginner" },
  { label: "Trung bình", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

/**
 * Sidebar lọc chi tiết (thay thế FilterOptions cũ)
 */
export function DataFilterSidebar({ categories = [], selectedFilters = {}, onFilterChange, className }) {
  const [expandedId, setExpandedId] = useState(null);

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
        setActiveLevels(data.map(l => l?.toLowerCase()));
      }
    }).catch(err => console.error(err));
  }, []);

  const filteredLevels = levels.filter(
    l => l.value === "all" || activeLevels.includes(l.value)
  );

  useEffect(() => {
    if (selectedFilters.categorySlug && categoryTree.length > 0) {
      const activeParent = categoryTree.find(p =>
        p.slug === selectedFilters.categorySlug ||
        p.subcategories?.some(c => c.slug === selectedFilters.categorySlug)
      );
      if (activeParent) setExpandedId(activeParent.id);
    }
  }, [selectedFilters.categorySlug, categoryTree]);

  return (
    <AppCard appVariant="default" className={cn("z-10 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin", className)}>
      <AppCardHeader className="pb-3 border-b border-border mb-4">
        <AppCardTitle className="text-lg font-bold text-center uppercase tracking-tighter">
          Lọc kết quả
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="flex flex-col gap-6">

        {/* Category Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Danh mục</h4>
          <RadioGroup
            value={selectedFilters.categorySlug || "all"}
            onValueChange={(val) => onFilterChange("categorySlug", val === "all" ? null : val)}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 group cursor-pointer py-1.5" onClick={() => setExpandedId(null)}>
              <AppRadioGroupItem value="all" id="cat-all" appVariant="warning" className="border-border" />
              <Label htmlFor="cat-all" className="text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
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
                      <AppRadioGroupItem
                        value={parent.slug}
                        id={`cat-${parent.id}`}
                        appVariant="warning"
                        className="border-border"
                      />
                      <Label htmlFor={`cat-${parent.id}`} className="text-sm font-bold text-foreground group-hover:text-foreground cursor-pointer transition-colors">
                        {parent.name}
                      </Label>
                    </div>
                    {hasSub && (
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </div>

                  {/* Subcategories (Level 2) - Collapsible */}
                  {isExpanded && hasSub && (
                    <div className="flex flex-col gap-1 animate-fade-up">
                      {parent.subcategories.map(child => (
                        <div key={child.id} className="flex items-center gap-2 group cursor-pointer py-1 ml-6">
                          <AppRadioGroupItem
                            value={child.slug}
                            id={`cat-${child.id}`}
                            appVariant="warning"
                            className="border-border"
                          />
                          <Label htmlFor={`cat-${child.id}`} className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
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

        <AppSeparator className="bg-secondary my-0" />

        {/* Level Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Trình độ</h4>
          <RadioGroup
            value={selectedFilters.level || "all"}
            onValueChange={(val) => onFilterChange("level", val)}
            className="flex flex-col gap-2.5"
          >
            {filteredLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-2 group cursor-pointer">
                <AppRadioGroupItem value={level.value} id={`level-${level.value}`} appVariant="warning" className="border-border" />
                <Label htmlFor={`level-${level.value}`} className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <AppSeparator className="bg-secondary my-0" />

        <div className="pt-2">
          <button
            onClick={() => {
              onFilterChange("categoryId", null);
              onFilterChange("level", "all");
            }}
            className="w-full h-10 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors uppercase"
          >
            Xóa tất cả lọc
          </button>
        </div>

      </AppCardContent>
    </AppCard>
  );
}

/**
 * Sidebar lọc checkbox (có tùy chọn Khoảng thời gian) - dùng cho MyCourses
 */
export function DataFilterSidebarChecklist({ 
  title = "Lọc kết quả",
  dateRange,
  onDateRangeChange,
  dateRangeTitle = "Khoảng thời gian",
  categoryTitle = "Danh mục khóa học",
  items = [], 
  selectedItems = [], 
  onItemToggle, 
  emptyMessage = "Không có dữ liệu.",
  className
}) {
  return (
    <AppCard appVariant="default" className={cn("z-10 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin", className)}>
      <AppCardHeader className="pb-3 border-b border-border mb-4">
        <AppCardTitle className="text-lg font-bold text-center uppercase tracking-tighter">
          {title}
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="flex flex-col gap-6">
        
        {onDateRangeChange && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{dateRangeTitle}</h4>
            <AppDateRangePicker 
              date={dateRange}
              onSelect={onDateRangeChange}
            />
          </div>
        )}

        {onDateRangeChange && (
          <AppSeparator className="bg-secondary my-0" />
        )}

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">{categoryTitle}</h4>
          <div className="space-y-3">
            {items.map((item) => (
              <AppCheckbox
                key={item}
                id={`chk-${item}`}
                label={item}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onItemToggle(item)}
              />
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            )}
          </div>
        </div>

        <AppSeparator className="bg-secondary my-0" />

        <div className="pt-2">
          <button
            onClick={() => {
              if (onDateRangeChange) onDateRangeChange({ from: undefined, to: undefined });
              // Gửi null hoặc mảng rỗng qua onClearAll để component cha tự xử lý state categories
              if (onItemToggle) onItemToggle("CLEAR_ALL"); 
            }}
            className="w-full h-10 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors uppercase"
          >
            Xóa tất cả lọc
          </button>
        </div>

      </AppCardContent>
    </AppCard>
  );
}

/**
 * AppDatePicker
 * Component chọn ngày tháng hoàn chỉnh, tích hợp sẵn Label và Description.
 */
export const AppDatePicker = forwardRef(({
  id,
  label,
  description,
  error,
  date,
  onSelect,
  placeholder = "Chọn ngày...",
  disabled,
  containerClassName,
  className,
  appVariant = "default",
  ...props
}, ref) => {
  const generatedId = useId();
  const datePickerId = id || generatedId;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <Label 
          htmlFor={datePickerId} 
          className={cn("text-sm font-medium text-foreground", disabled && "opacity-50")}
        >
          {label}
        </Label>
      )}

      {description && (
        <p className={cn("text-[0.8rem] text-muted-foreground", disabled && "opacity-50")}>
          {description}
        </p>
      )}

      <AppPopover>
        <AppPopoverTrigger asChild>
          <Button
            id={datePickerId}
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-card border border-border hover:bg-muted transition-colors !text-foreground",
              !date && "!text-muted-foreground",
              error && "border-error/20 focus-visible:ring-error",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: vi }) : placeholder}
          </Button>
        </AppPopoverTrigger>
        <AppPopoverContent 
          align="start" 
          className={cn(
            "w-auto p-0 border-none shadow-lg bg-card rounded-xl z-[100]", 
            appVariant === "glass" && "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
          )}
        >
          <AppCalendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            className={cn("border-none shadow-none", appVariant === "glass" && "bg-transparent")}
            {...props}
          />
        </AppPopoverContent>
      </AppPopover>

      {error && <p className="text-error text-xs mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppDatePicker.displayName = "AppDatePicker";


/**
 * AppDateRangePicker
 * Component chọn khoảng thời gian (từ ngày - đến ngày).
 */
export const AppDateRangePicker = forwardRef(({
  id,
  label,
  description,
  error,
  date, 
  onSelect,
  placeholder = "Chọn khoảng thời gian...",
  disabled,
  containerClassName,
  className,
  appVariant = "default",
  numberOfMonths = 1,
  ...props
}, ref) => {
  const generatedId = useId();
  const datePickerId = id || generatedId;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <Label 
          htmlFor={datePickerId} 
          className={cn("text-sm font-medium text-foreground", disabled && "opacity-50")}
        >
          {label}
        </Label>
      )}

      {description && (
        <p className={cn("text-[0.8rem] text-muted-foreground", disabled && "opacity-50")}>
          {description}
        </p>
      )}

      <AppPopover>
        <AppPopoverTrigger asChild>
          <Button
            id={datePickerId}
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-card border border-border hover:bg-muted transition-colors !text-foreground",
              !date?.from && "!text-muted-foreground",
              error && "border-error/20 focus-visible:ring-error",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: vi })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: vi })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </AppPopoverTrigger>
        <AppPopoverContent 
          align="start" 
          className={cn(
            "w-auto p-0 border-none shadow-lg bg-card rounded-xl z-[100]", 
            appVariant === "glass" && "bg-background/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
          )}
        >
          <AppCalendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={numberOfMonths}
            className={cn("border-none shadow-none", appVariant === "glass" && "bg-transparent")}
            {...props}
          />
        </AppPopoverContent>
      </AppPopover>

      {error && <p className="text-error text-xs mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

AppDateRangePicker.displayName = "AppDateRangePicker";

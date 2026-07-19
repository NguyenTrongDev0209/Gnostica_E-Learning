import React, { useState, useEffect, forwardRef, useId, useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, ChevronDown, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import courseService from "@/services/course/courseService";

// Micro components
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import AppCard, { AppCardHeader, AppCardTitle, AppCardContent } from "@/components/common/micro/AppCard";
import AppSeparator from "@/components/common/micro/AppSeparator";
import { Label } from "@/components/ui/label";
import { AppCheckbox } from "@/components/common/micro/AppCheckbox";
import AppPopover, { AppPopoverContent, AppPopoverTrigger } from "@/components/common/micro/AppPopover";
import { Button } from "@/components/ui/button";
import AppCalendar from "@/components/common/micro/AppCalendar";
import { Slider } from "@/components/ui/slider";
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
  dropdownChecklists = [], // Mảng config cho các DataFilterDropdownChecklist
  containerClassName = "",
  children,
}) {
  const [selectedPreset, setSelectedPreset] = useState("custom");

  const calculatePresetRange = (preset) => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    switch (preset) {
        case "yesterday":
            start.setDate(now.getDate() - 1);
            end.setDate(now.getDate() - 1);
            break;
        case "last-7-days":
            start.setDate(now.getDate() - 6);
            break;
        case "last-30-days":
            start.setDate(now.getDate() - 29);
            break;
        case "this-month":
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case "last-month":
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case "this-quarter":
            const quarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), quarter * 3, 1);
            break;
        case "6-months":
            start.setMonth(now.getMonth() - 6);
            break;
        case "this-year":
            start = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            return null;
    }
    return { from: start, to: end };
  };

  const handlePresetSelect = (value) => {
    setSelectedPreset(value);
    const range = calculatePresetRange(value);
    if (range && onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const handleDateRangeSelect = (range) => {
    setSelectedPreset("custom");
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

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

      {dropdownChecklists && dropdownChecklists.length > 0 && dropdownChecklists.map((checklist, index) => (
        <div key={index} className="w-full xl:w-auto">
          <DataFilterDropdownChecklist {...checklist} />
        </div>
      ))}

      {onDateRangeChange && (
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="w-full xl:w-[240px]">
            <AppDateRangePicker 
              date={dateRange}
              onSelect={handleDateRangeSelect}
              placeholder={dateRangePlaceholder}
              className="!h-11"
            />
          </div>
          <span className="text-muted-foreground font-medium">-</span>
          <div className="w-[140px] shrink-0">
             <AppSelect 
                value={selectedPreset} 
                onValueChange={handlePresetSelect}
                options={[
                    ...(selectedPreset === "custom" ? [{ label: "Tùy chọn", value: "custom" }] : []),
                    { label: "Hôm qua", value: "yesterday" },
                    { label: "7 ngày qua", value: "last-7-days" },
                    { label: "30 ngày qua", value: "last-30-days" },
                    { label: "Tháng này", value: "this-month" },
                    { label: "Tháng trước", value: "last-month" },
                    { label: "Quý này", value: "this-quarter" },
                    { label: "6 tháng qua", value: "6-months" },
                    { label: "Năm nay", value: "this-year" },
                ]}
                placeholder="Khoảng thời gian"
                className="!h-11 bg-card border border-border text-sm font-medium rounded-xl shadow-sm"
            />
          </div>
        </div>
      )}
      
      {children}
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
  const selectedPriceRange = selectedFilters.priceRange || [0, 2000000];
  const [draftPriceRange, setDraftPriceRange] = useState(selectedPriceRange);

  const categoryTree = useMemo(() => categories
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories?.filter(sub => sub.courses > 0) || []
    }))
    .filter(cat => cat.courses > 0 || cat.subcategories.length > 0), [categories]);

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

  const selectedCategorySlugs = selectedFilters.categorySlugs
    || (selectedFilters.categorySlug ? [selectedFilters.categorySlug] : []);
  const selectedLevels = selectedFilters.levels
    || (selectedFilters.level && selectedFilters.level !== "all" ? [selectedFilters.level] : []);

  const toggleFilterValue = (key, values, value, checked) => {
    const nextValues = checked
      ? [...new Set([...values, value])]
      : values.filter((item) => item !== value);
    onFilterChange(key, nextValues);
  };

  useEffect(() => {
    if (selectedCategorySlugs.length > 0 && categoryTree.length > 0) {
      const activeParent = categoryTree.find(p =>
        selectedCategorySlugs.includes(p.slug) ||
        p.subcategories?.some(c => selectedCategorySlugs.includes(c.slug))
      );
      if (activeParent) setExpandedId(activeParent.id);
    }
  }, [selectedCategorySlugs, categoryTree]);

  return (
    <AppCard appVariant="default" className={cn("z-10 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin", className)}>
      <AppCardHeader className="pb-3 border-b border-border mb-4">
        <AppCardTitle className="app-section-title text-center">
          Lọc kết quả
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="flex flex-col gap-6">

        {/* Category Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="app-section-title">Danh mục</h4>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 group cursor-pointer py-1.5" onClick={() => setExpandedId(null)}>
              <AppCheckbox
                id="cat-all"
                appVariant="accent"
                appSize="sm"
                checked={selectedCategorySlugs.length === 0}
                onCheckedChange={() => onFilterChange("categorySlugs", [])}
              />
              <Label htmlFor="cat-all" className="app-body-text text-foreground cursor-pointer">
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
                    className="flex items-center justify-between group cursor-pointer py-1.5"
                    onClick={() => setExpandedId(isExpanded ? null : parent.id)}
                  >
                    <div className="flex items-center gap-2">
                      <AppCheckbox
                        id={`cat-${parent.id}`}
                        appVariant="accent"
                        appSize="sm"
                        checked={selectedCategorySlugs.includes(parent.slug)}
                        onCheckedChange={(checked) => toggleFilterValue("categorySlugs", selectedCategorySlugs, parent.slug, checked)}
                      />
                      <Label htmlFor={`cat-${parent.id}`} className="app-body-text text-foreground cursor-pointer">
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
                          <AppCheckbox
                            id={`cat-${child.id}`}
                            appVariant="accent"
                            appSize="sm"
                            checked={selectedCategorySlugs.includes(child.slug)}
                            onCheckedChange={(checked) => toggleFilterValue("categorySlugs", selectedCategorySlugs, child.slug, checked)}
                          />
                          <Label htmlFor={`cat-${child.id}`} className="app-body-text text-foreground cursor-pointer">
                            {child.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <AppSeparator className="bg-secondary my-0" />

        {/* Level Filter */}
        <div className="flex flex-col gap-3">
          <h4 className="app-section-title">Trình độ</h4>
          <div className="flex flex-col gap-1">
            {filteredLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-2 group cursor-pointer py-1.5">
                <AppCheckbox
                  id={`level-${level.value}`}
                  appVariant="accent"
                  appSize="sm"
                  checked={level.value === "all" ? selectedLevels.length === 0 : selectedLevels.includes(level.value)}
                  onCheckedChange={(checked) => level.value === "all"
                    ? onFilterChange("levels", [])
                    : toggleFilterValue("levels", selectedLevels, level.value, checked)}
                />
                <Label htmlFor={`level-${level.value}`} className="app-body-text text-foreground cursor-pointer">
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <AppSeparator className="bg-secondary my-0" />

        {/* Price Filter */}
        <div className="flex flex-col gap-4">
          <h4 className="app-section-title">Khoảng giá</h4>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground">
            <span className="rounded-md bg-accent/10 px-2 py-1 text-accent">
              {new Intl.NumberFormat("vi-VN").format(draftPriceRange[0])}đ
            </span>
            <span className="text-muted-foreground">—</span>
            <span className="rounded-md bg-accent/10 px-2 py-1 text-accent">
              {new Intl.NumberFormat("vi-VN").format(draftPriceRange[1])}đ
            </span>
          </div>
          <Slider
            min={0}
            max={2000000}
            step={50000}
            value={draftPriceRange}
            onValueChange={setDraftPriceRange}
            onValueCommit={(value) => onFilterChange("priceRange", value)}
            className="[&_[data-slot=slider-range]]:bg-accent [&_[data-slot=slider-thumb]]:border-accent [&_[data-slot=slider-thumb]]:ring-accent/40"
            aria-label="Lọc khóa học theo khoảng giá"
          />
        </div>

        <AppSeparator className="bg-secondary my-0" />

        <div className="pt-2">
          <button
            onClick={() => {
              onFilterChange("categorySlugs", []);
              onFilterChange("levels", []);
              setDraftPriceRange([0, 2000000]);
              onFilterChange("priceRange", [0, 2000000]);
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
        <AppCardTitle className="app-section-title text-center">
          {title}
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent className="flex flex-col gap-6">
        
        {onDateRangeChange && (
          <div className="flex flex-col gap-3">
            <h4 className="app-section-title">{dateRangeTitle}</h4>
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
          <h4 className="app-section-title">{categoryTitle}</h4>
          <div className="space-y-3">
            {items.map((item) => (
              <AppCheckbox
                key={item}
                id={`chk-${item}`}
                label={item}
                labelClassName="app-body-text"
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onItemToggle(item)}
              />
            ))}
            {items.length === 0 && (
              <p className="app-body-text text-muted-foreground">{emptyMessage}</p>
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
              "w-full h-11 justify-start text-left font-normal bg-muted border-border focus:bg-white transition-colors",
              !date?.from && "text-muted-foreground",
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

export function ChartDateFilters({
  onDateChange,
  onPresetChange,
  defaultPreset = "6-months"
}) {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);

  // Helpers for Date Calculation
  const getToday = () => new Date();
  const formatDateInput = (date) => {
      if (!date) return "";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
  };
  const formatWithTime = (dateStr, isEnd) => {
      if (!dateStr) return "";
      const now = getToday();
      const todayStr = formatDateInput(now);

      if (isEnd) {
          if (dateStr === todayStr) {
              // Return current time if it's today
              return `${dateStr}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          }
          return `${dateStr}T23:59:59`;
      }
      return `${dateStr}T00:00:00`;
  };

  const calculatePresetRange = (preset) => {
      const now = getToday();
      let start = new Date(now);
      let end = new Date(now);

      switch (preset) {
          case "yesterday":
              start.setDate(now.getDate() - 1);
              end.setDate(now.getDate() - 1);
              break;
          case "last-7-days":
              start.setDate(now.getDate() - 6);
              break;
          case "last-30-days":
              start.setDate(now.getDate() - 29);
              break;
          case "this-month":
              start = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
          case "last-month":
              start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              end = new Date(now.getFullYear(), now.getMonth(), 0);
              break;
          case "this-quarter":
              const quarter = Math.floor(now.getMonth() / 3);
              start = new Date(now.getFullYear(), quarter * 3, 1);
              break;
          case "6-months":
              start.setMonth(now.getMonth() - 6);
              break;
          case "this-year":
              start = new Date(now.getFullYear(), 0, 1);
              break;
          default:
              return null;
      }
      return { from: start, to: end };
  };

  // Initialize dates based on default preset
  useEffect(() => {
      const range = calculatePresetRange(defaultPreset);
      if (range) {
          setDateRange(range);
          notifyParent(range.from, range.to);
      }
  }, []);

  const notifyParent = (from, to) => {
      if (from) {
          onDateChange?.('start', formatWithTime(formatDateInput(from), false));
      }
      if (to) {
          onDateChange?.('end', formatWithTime(formatDateInput(to), true));
      }
  };

  const handlePresetSelect = (value) => {
      setSelectedPreset(value);
      onPresetChange?.(value);

      const range = calculatePresetRange(value);
      if (range) {
          setDateRange(range);
          notifyParent(range.from, range.to);
      }
  };

  const handleDateRangeSelect = (range) => {
      setDateRange(range);
      setSelectedPreset("custom"); // Set to custom when manually changed
      notifyParent(range?.from, range?.to);
  };

  return (
      <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="w-[280px]">
              <AppDateRangePicker 
                  date={dateRange}
                  onSelect={handleDateRangeSelect}
                  placeholder="Khoảng thời gian"
                  className="!h-11 bg-card border border-border text-sm font-medium rounded-xl shadow-sm hover:bg-card/90"
              />
          </div>

          {/* Presets Selector */}
          <AppSelect 
              value={selectedPreset} 
              onValueChange={handlePresetSelect}
              options={[
                  ...(selectedPreset === "custom" ? [{ label: "Tùy chọn", value: "custom" }] : []),
                  { label: "Hôm qua", value: "yesterday" },
                  { label: "7 ngày qua", value: "last-7-days" },
                  { label: "30 ngày qua", value: "last-30-days" },
                  { label: "Tháng này", value: "this-month" },
                  { label: "Tháng trước", value: "last-month" },
                  { label: "Quý này", value: "this-quarter" },
                  { label: "6 tháng qua", value: "6-months" },
                  { label: "Năm nay", value: "this-year" },
              ]}
              placeholder="Chọn khoảng thời gian"
              className="!h-11 w-[140px] bg-card border border-border text-sm font-medium rounded-xl shadow-sm"
          />
      </div>
  );
}
/**
 * Dropdown lọc dạng checkbox
 */
export function DataFilterDropdownChecklist({ 
  title = "Lọc",
  items = [], 
  selectedItems = [], 
  onItemToggle, 
  onClear,
  emptyMessage = "Không có dữ liệu.",
  className
}) {
  return (
    <AppPopover>
      <AppPopoverTrigger asChild>
        <Button variant="outline" className={cn("h-11 min-w-[180px] justify-between bg-card border-border hover:bg-muted font-normal text-foreground", className)}>
          <span className="truncate">{title}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </AppPopoverTrigger>
      <AppPopoverContent align="start" className="w-auto min-w-[240px] p-4 bg-card rounded-xl shadow-lg border-border z-[100]">
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-sm text-foreground uppercase tracking-widest">{title}</h4>
          <div className="space-y-3">
            {items.map((item) => {
              const val = typeof item === 'object' ? item.value : item;
              const lbl = typeof item === 'object' ? item.label : item;
              return (
                <AppCheckbox
                  key={val}
                  id={`dd-chk-${val}`}
                  label={lbl}
                  checked={selectedItems.includes(val)}
                  onCheckedChange={() => onItemToggle && onItemToggle(val)}
                />
              );
            })}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            )}
          </div>
          
          <AppSeparator className="bg-secondary my-0" />
          
          <button
            onClick={() => onClear && onClear()}
            className="w-full h-9 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors uppercase"
          >
            Xóa bộ lọc
          </button>
        </div>
      </AppPopoverContent>
    </AppPopover>
  );
}

/**
 * Dropdown lọc giá dạng slider hai đầu
 */
export function DataFilterPriceRange({
  title = "Khoảng giá",
  min = 0,
  max = 10000000,
  step = 50000,
  value = [0, 10000000],
  onValueChange,
  onClear,
  formatValue,
  className
}) {
  const defaultFormat = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' đ';
  const fmt = formatValue || defaultFormat;

  return (
    <AppPopover>
      <AppPopoverTrigger asChild>
        <Button variant="outline" className={cn("h-11 min-w-[180px] justify-between bg-card border-border hover:bg-muted font-normal text-foreground", className)}>
          <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate">{title}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </AppPopoverTrigger>
      <AppPopoverContent align="start" className="w-[300px] p-5 bg-card rounded-xl shadow-lg border-border z-[100]">
        <div className="flex flex-col gap-5">
          <h4 className="font-bold text-sm text-foreground uppercase tracking-widest">{title}</h4>
          
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">{fmt(value[0])}</span>
            <span className="text-muted-foreground mx-2">—</span>
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">{fmt(value[1])}</span>
          </div>

          <div className="px-1">
            <Slider
              min={min}
              max={max}
              step={step}
              value={value}
              onValueChange={onValueChange}
              className="w-full"
            />
          </div>

          <AppSeparator className="bg-secondary my-0" />

          <button
            onClick={() => onClear && onClear()}
            className="w-full h-9 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors uppercase"
          >
            Xóa bộ lọc
          </button>
        </div>
      </AppPopoverContent>
    </AppPopover>
  );
}

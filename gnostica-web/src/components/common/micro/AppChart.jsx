import React, { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

/**
 * AppChart: Component bao bọc Shadcn Chart/Recharts giúp tạo biểu đồ nhanh chóng.
 * 
 * @param {string} type - Loại biểu đồ: "bar", "line", "area", "pie", "donut"
 * @param {Array} data - Dữ liệu biểu đồ (Mảng các object)
 * @param {Object} config - Cấu hình biểu đồ theo chuẩn Shadcn Chart (label, color, icon)
 * @param {string} xAxisKey - Tên trường dữ liệu dùng cho trục X (mặc định "name" hoặc "month")
 * @param {string} nameKey - Tên trường dùng cho nhãn (dành riêng cho biểu đồ tròn pie/donut)
 * @param {string} dataKey - Tên trường dùng cho giá trị (dành riêng cho biểu đồ tròn pie/donut)
 * @param {boolean} showLegend - Có hiển thị chú thích (Legend) không
 * @param {boolean} showGrid - Có hiển thị đường kẻ lưới không
 * @param {boolean} hideAxis - Có ẩn trục tọa độ không
 */
export function AppChart({
  type = "bar",
  data = [],
  config = {},
  xAxisKey = "name",
  nameKey = "name",
  dataKey = "value",
  showLegend = false,
  showGrid = true,
  hideAxis = false,
  className,
  tooltipContent,
  children,
  ...props
}) {
  // Lấy danh sách các key dữ liệu từ config (bỏ qua các thuộc tính nội bộ của shadcn config)
  const seriesKeys = useMemo(() => {
    return Object.keys(config).filter(key => key !== 'theme' && key !== 'color');
  }, [config]);

  // Nếu không có data, không render gì hoặc render fallback
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">Chưa có dữ liệu biểu đồ</div>;
  }

  const renderChartContent = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            {!hideAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice ? value.slice(0, 3) : value}
              />
            )}
            <ChartTooltip cursor={false} content={tooltipContent || <ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {seriesKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={4}
              />
            ))}
            {children}
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            {!hideAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice ? value.slice(0, 3) : value}
              />
            )}
            <ChartTooltip cursor={false} content={tooltipContent || <ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {seriesKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
            {children}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              {seriesKeys.map((key) => (
                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            {!hideAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice ? value.slice(0, 3) : value}
              />
            )}
            <ChartTooltip cursor={false} content={tooltipContent || <ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {seriesKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                fillOpacity={1}
                fill={`url(#fill${key})`}
              />
            ))}
            {children}
          </AreaChart>
        );
      case "pie":
      case "donut":
        return (
          <PieChart>
            <ChartTooltip cursor={false} content={tooltipContent || <ChartTooltipContent hideLabel />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={type === "donut" ? 60 : 0}
              outerRadius={80}
              paddingAngle={type === "donut" ? 3 : 0}
            >
              {data.map((entry, index) => {
                // Ưu tiên dùng `fill` từ data, nếu không thì dùng color từ biến CSS sinh ra bởi config
                const keyName = entry[nameKey] || entry.name;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill || `var(--color-${keyName})`} 
                  />
                );
              })}
            </Pie>
            {children}
          </PieChart>
        );
      default:
        return children;
    }
  };

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full h-full min-h-[250px]", className)} {...props}>
      {renderChartContent()}
    </ChartContainer>
  );
}

export default AppChart;

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent };

import { format } from "date-fns";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import DataTable from "@/components/common/composite/DataTable";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppSelect from "@/components/common/micro/AppSelect";
import DataFilter, { DataFilterPriceRange } from "@/components/common/composite/DataFilter";
import {CreditCard, History, ArrowDownCircle, ShoppingBag, ArrowUpCircle, RotateCcw, Eye, Info, DollarSign, Calendar, Building2, User} from "lucide-react";
import { useTransactions } from "@/hooks/payment/useTransactions";
import AppBadge from "@/components/common/micro/AppBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";
import {
  AppDialogRoot as Dialog,
  AppDialogContent as DialogContent,
  AppDialogHeader as DialogHeader,
  AppDialogTitle as DialogTitle,
} from "@/components/common/micro/AppDialog";

const DEFAULT_MAX_AMOUNT = 10_000_000;
const AMOUNT_STEP = 50_000;

const TRANSACTION_MODULES = {
  payments: {
    title: "Giao Dịch Thanh Toán",
    description: "Kiểm tra và đối soát các giao dịch thanh toán trên nền tảng.",
  },
  withdrawals: {
    title: "Giao Dịch Rút Tiền",
    description: "Theo dõi các yêu cầu rút tiền và trạng thái chuyển khoản.",
  },
  refunds: {
    title: "Giao Dịch Hoàn Tiền",
    description: "Theo dõi các khoản hoàn tiền và lý do xử lý.",
  },
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN", {
  style: "currency",
  currency: "VND",
});

const formatTransactionDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : format(date, "HH:mm dd/MM/yyyy");
};

export default function AdminTransactions() {
  const [searchParams] = useSearchParams();
  const requestedModule = searchParams.get("tab") || "payments";
  const activeModule = TRANSACTION_MODULES[requestedModule] ? requestedModule : "payments";
  const { transactions, isLoading } = useTransactions(activeModule);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [amountRange, setAmountRange] = useState([0, null]);
  const [amountPreset, setAmountPreset] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const highestAmount = transactions.reduce(
    (max, tx) => Math.max(max, Number(tx.amount) || 0),
    DEFAULT_MAX_AMOUNT,
  );
  const amountSliderMax = Math.ceil(highestAmount / AMOUNT_STEP) * AMOUNT_STEP;
  const displayedAmountRange = [amountRange[0], amountRange[1] ?? amountSliderMax];

  const filteredTransactions = transactions.filter((tx) => {
    const searchStr = searchTerm.trim().toLowerCase();
    const searchableValues = [
      tx.transactionCode,
      tx.performerName,
      tx.performerEmail,
      tx.ref,
      tx.paymentMethod,
      tx.senderBankId,
      tx.senderAccountNumber,
    ];
    const matchesSearch = !searchStr || searchableValues.some(
      (value) => String(value ?? "").toLowerCase().includes(searchStr),
    );

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(String(tx.status));

    const transactionDate = tx.createdAt ? new Date(tx.createdAt) : null;
    const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
    const toDate = dateRange?.to ? new Date(dateRange.to) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    const matchesDate = (!fromDate || (transactionDate && transactionDate >= fromDate))
      && (!toDate || (transactionDate && transactionDate <= toDate));

    const amount = Number(tx.amount) || 0;
    const matchesAmount = amount >= amountRange[0]
      && (amountRange[1] == null || amount <= amountRange[1]);

    return matchesSearch && matchesStatus && matchesDate && matchesAmount;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const startIndex = currentPage * pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(0);
  }, [searchTerm, statusFilter, dateRange, amountRange, activeModule]);

  const handleAmountPresetChange = (preset) => {
    setAmountPreset(preset);
    switch (preset) {
      case "under_500k":
        setAmountRange([0, 500_000]);
        break;
      case "500k_1m":
        setAmountRange([500_000, 1_000_000]);
        break;
      case "1m_5m":
        setAmountRange([1_000_000, 5_000_000]);
        break;
      case "over_5m":
        setAmountRange([5_000_000, null]);
        break;
      case "all":
        setAmountRange([0, null]);
        break;
      default:
        break;
    }
  };

  const handleCustomAmountChange = (value) => {
    setAmountPreset("custom");
    setAmountRange(value);
  };

  const handleDetailClick = (tx) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <TransactionHeader module={activeModule} />
      
      <TransactionFilters
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        amountPreset={amountPreset}
        onAmountPresetChange={handleAmountPresetChange}
        amountRange={displayedAmountRange}
        amountMax={amountSliderMax}
        onAmountRangeChange={handleCustomAmountChange}
      />
      
      <TransactionTable 
        transactions={paginatedTransactions} 
        isLoading={isLoading} 
        onDetailClick={handleDetailClick}
        startIndex={startIndex}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: filteredTransactions.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(0);
          },
          zeroIndexed: true,
          pageSize,
        }}
      />
      
      <TransactionDetailModal 
        isOpen={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen} 
        transaction={selectedTransaction} 
      />
    </div>
  );
}


function TransactionHeader({ module }) {
  const content = TRANSACTION_MODULES[module] || TRANSACTION_MODULES.payments;
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          {content.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {content.description}
        </p>
      </div>
    </div>
  );
}

function TransactionFilters({
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
  dateRange, onDateRangeChange,
  amountPreset, onAmountPresetChange,
  amountRange, amountMax, onAmountRangeChange,
}) {
  return (
    <DataFilter
      searchQuery={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm theo mã, nội dung, ngân hàng..."
      dropdownChecklists={[
        {
          title: "Trạng thái",
          items: [
            { label: "Chờ xử lý", value: "1" },
            { label: "Thành công", value: "2" },
            { label: "Thất bại", value: "3" },
            { label: "Đã hoàn tiền", value: "4" },
          ],
          selectedItems: statusFilter,
          onItemToggle: (value) => onStatusChange(
            statusFilter.includes(value)
              ? statusFilter.filter((item) => item !== value)
              : [...statusFilter, value],
          ),
          onClear: () => onStatusChange([]),
        },
      ]}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
      dateRangePlaceholder="Ngày giao dịch"
    >
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <div className="w-full xl:w-[200px] shrink-0">
          <AppSelect
            value={amountPreset}
            onValueChange={onAmountPresetChange}
            options={[
              ...(amountPreset === "custom" ? [{ label: "Tùy chọn", value: "custom" }] : []),
              { label: "Tất cả số tiền", value: "all" },
              { label: "Dưới 500.000 đ", value: "under_500k" },
              { label: "500.000 đ - 1.000.000 đ", value: "500k_1m" },
              { label: "1.000.000 đ - 5.000.000 đ", value: "1m_5m" },
              { label: "Trên 5.000.000 đ", value: "over_5m" },
            ]}
            placeholder="Chọn khoảng tiền"
          />
        </div>
        <DataFilterPriceRange
          title="Số tiền"
          min={0}
          max={amountMax}
          step={AMOUNT_STEP}
          value={amountRange}
          onValueChange={onAmountRangeChange}
          onClear={() => onAmountPresetChange("all")}
        />
      </div>
    </DataFilter>
  );
}

function TransactionTable({ transactions, isLoading, onDetailClick, startIndex = 0, pagination }) {
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 1: return <ArrowDownCircle className="w-4 h-4 text-success" />;
      case 2: return <ShoppingBag className="w-4 h-4 text-info" />;
      case 3: return <ArrowUpCircle className="w-4 h-4 text-warning" />;
      case 4: return <RotateCcw className="w-4 h-4 text-error" />;
      default: return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 1: return "Nạp tiền";
      case 2: return "Thanh toán";
      case 3: return "Rút tiền";
      case 4: return "Hoàn tiền";
      default: return "Khác";
    }
  };

  const getStatusBadge = (status, label) => {
    switch (status) {
      case 2: return <AppBadge variant="success" className="w-[110px] justify-center px-2.5 py-1">{label || "Thành công"}</AppBadge>;
      case 1: return <AppBadge variant="secondary" className="w-[110px] justify-center px-2.5 py-1">{label || "Chờ xử lý"}</AppBadge>;
      case 3: return <AppBadge variant="error" className="w-[110px] justify-center px-2.5 py-1">{label || "Thất bại"}</AppBadge>;
      case 4: return <AppBadge variant="outline" className="w-[110px] justify-center px-2.5 py-1">{label || "Đã hoàn tiền"}</AppBadge>;
      default: return <AppBadge variant="outline" className="w-[110px] justify-center px-2.5 py-1">{label || "Không rõ"}</AppBadge>;
    }
  };

  return (
    <DataTable
          selection={false}
          pagination={pagination}
          columns={[
            {
              header: "STT",
              width: "72px",
              className: "py-4",
              cellClassName: "font-bold text-muted-foreground py-4 text-center",
              render: (_, index) => startIndex + index + 1,
            },
            {
              header: "Mã giao dịch",
              width: "180px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "text-sm font-bold text-foreground py-4 text-center whitespace-nowrap",
              render: (tx) => tx.transactionCode ?? "N/A",
            },
            {
              header: "Người thực hiện",
              width: "240px",
              className: "py-4",
              cellClassName: "py-4",
              render: (tx) => (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border shrink-0">
                    <AvatarImage src={tx.performerAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {tx.performerName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate font-bold text-foreground">
                      {tx.performerName || "Không xác định"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {tx.performerEmail || "N/A"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Số tiền",
              width: "140px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "font-bold text-foreground py-4 text-center whitespace-nowrap",
              render: (tx) => formatCurrency(tx.amount),
            },
            {
              header: "Phân loại",
              width: "150px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
              render: (tx) => (
                <div className="flex items-center justify-center gap-1.5">
                  {getTypeIcon(tx.type)}
                  {getTypeText(tx.type)}
                </div>
              ),
            },
            {
              header: "Phương thức",
              width: "150px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "text-sm font-medium text-foreground py-4 text-center whitespace-nowrap",
              render: (tx) => tx.paymentMethod,
            },
            {
              header: "Trạng thái",
              width: "150px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "py-4 whitespace-nowrap",
              render: (tx) => <div className="flex justify-center w-full">{getStatusBadge(tx.status, tx.statusLabel)}</div>,
            },
            {
              header: "Ngày giao dịch",
              width: "180px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "text-sm text-foreground font-medium py-4 text-center whitespace-nowrap",
              render: (tx) => formatTransactionDate(tx.createdAt),
            },
            {
              header: "Thao tác",
              width: "80px",
              className: "py-4 whitespace-nowrap",
              cellClassName: "py-4 text-center whitespace-nowrap",
              render: (tx) => (
                <TableActionIconButton
                  icon={Eye}
                  onClick={() => onDetailClick(tx)}
                  title="Xem chi tiết"
                />
              ),
            },
          ]}
          data={transactions}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <CreditCard className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy giao dịch nào.</p>
            </div>
          }
        />
  );
}

// eslint-disable-next-line no-unused-vars
const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
      <Icon className="w-3 h-3" /> {label}
    </span>
    <span className="text-sm font-semibold text-foreground">{value || 'N/A'}</span>
  </div>
);

function TransactionDetailModal({ isOpen, onOpenChange, transaction }) {
  if (!transaction) return null;

  const detailStatusVariant = transaction.status === 2
    ? "success"
    : transaction.status === 3
      ? "error"
      : transaction.status === 4
        ? "outline"
        : "secondary";

  let logs = transaction.log || null;
  if (typeof logs === "string") {
    try {
      logs = JSON.parse(logs);
    } catch {
      logs = { raw: logs };
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-4">
            Chi tiết Giao dịch
            <span className="text-xs font-mono text-muted-foreground">#{transaction.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <DetailItem icon={Info} label="Mã giao dịch" value={transaction.transactionCode} className="col-span-2" />

          <DetailItem icon={User} label="Người thực hiện" value={transaction.performerName} />
          <DetailItem icon={Info} label="Email" value={transaction.performerEmail} />
          
          <DetailItem icon={DollarSign} label="Số tiền" value={formatCurrency(transaction.amount)} />
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
              Trạng thái
            </span>
            <div>
              <AppBadge variant={detailStatusVariant}>
                {transaction.statusLabel || "Không rõ"}
              </AppBadge>
            </div>
          </div>

          <DetailItem icon={CreditCard} label="Phương thức" value={transaction.paymentMethod} />
          <DetailItem icon={Calendar} label="Thời gian" value={formatTransactionDate(transaction.createdAt)} />
          
          <div className="col-span-2 h-px bg-secondary my-2"></div>

          <DetailItem
            icon={Building2}
            label={transaction.type === 3 ? "Ngân hàng nhận" : "Ngân hàng người gửi"}
            value={transaction.senderBankId}
          />
          <DetailItem
            icon={User}
            label={transaction.type === 3 ? "Số tài khoản nhận" : "Số tài khoản người gửi"}
            value={transaction.senderAccountNumber}
          />
          <DetailItem icon={Info} label="Nội dung/Tham chiếu" value={transaction.ref} className="col-span-2" />

          {logs && (
            <div className="col-span-2 space-y-2 mt-4">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                Dữ liệu Log (JSON Metadata)
              </span>
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-[11px] text-success font-mono leading-relaxed">
                  {JSON.stringify(logs, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { Search, CreditCard } from "lucide-react";
import { useTransactions } from "@/hooks/payment/useTransactions";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";

export default function AdminTransactions() {
  // eslint-disable-next-line no-unused-vars
  const { transactions, isLoading, fetchTransactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = transactions.filter((tx) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (tx.transactionCode?.toLowerCase().includes(searchStr)) ||
      (tx.ref?.toLowerCase().includes(searchStr));
    
    let matchesType = true;
    if (typeFilter !== "all") {
      matchesType = tx.type === Number(typeFilter);
    }

    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = tx.status === Number(statusFilter);
    }

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const handleDetailClick = (tx) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <TransactionHeader />
      
      <TransactionStatsFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={transactions.length} 
      />
      
      <TransactionTable 
        transactions={paginatedTransactions} 
        isLoading={isLoading} 
        onDetailClick={handleDetailClick}
        startIndex={startIndex}
      />

      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row shadow-sm bg-white rounded-b-xl items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            Hiển thị <span className="font-bold text-foreground">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)}</span> trong số <span className="font-bold text-foreground">{filteredTransactions.length}</span> giao dịch
          </div>
          <div className="flex gap-1">
            <AppButton appVariant="ghostMuted" variant="ghost" 
              size="sm" 
              className="h-8 border border-border" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </AppButton>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return currentPage === pageNumber ? (
                <AppButton appVariant="gradient" 
                  key={pageNumber}
                  size="sm" 
                  className="h-8"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </AppButton>
              ) : (
                <AppButton appVariant="ghostMuted" variant="ghost" 
                  key={pageNumber}
                  size="sm" 
                  className="h-8 border border-border bg-white text-muted-foreground hover:bg-muted"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </AppButton>
              );
            })}

            <AppButton appVariant="ghostMuted" variant="ghost" 
              size="sm" 
              className="h-8 border border-border" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </AppButton>
          </div>
        </div>
      )}
      
      <TransactionDetailModal 
        isOpen={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen} 
        transaction={selectedTransaction} 
      />
    </div>
  );
}


function TransactionHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Lịch sử Giao dịch
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi và quản lý toàn bộ dòng tiền nạp, rút và thanh toán trên hệ thống.
        </p>
      </div>
    </div>
  );
}

function TransactionStatsFilter({ 
  searchTerm, onSearchChange, 
  typeFilter, onTypeChange,
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
                placeholder="Tìm giao dịch (mã, nội dung)..."
                className="pl-9 h-10 border-border focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[150px] flex-shrink-0">
              <Select value={typeFilter} onValueChange={onTypeChange}>
                <SelectTrigger className="!h-10 w-full border-border focus:ring-0 bg-white text-muted-foreground">
                  <SelectValue placeholder="Phân loại" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border border-border shadow-md">
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="1">Nạp tiền</SelectItem>
                  <SelectItem value="2">Thanh toán</SelectItem>
                  <SelectItem value="3">Rút tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[150px] flex-shrink-0">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="!h-10 w-full border-border focus:ring-0 bg-white text-muted-foreground">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border border-border shadow-md">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="1">Thành công</SelectItem>
                  <SelectItem value="0">Chờ xử lý</SelectItem>
                  <SelectItem value="2">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AppCardContent>
      </AppCard>
      <AppCard appVariant="default" className="border-border shadow-sm bg-muted">
        <AppCardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </AppCardContent>
      </AppCard>
    </div>
  );
}

function TransactionTable({ transactions, isLoading, onDetailClick, startIndex = 0 }) {
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 1: return <ArrowDownCircle className="w-4 h-4 text-success" />;
      case 2: return <ShoppingBag className="w-4 h-4 text-info" />;
      case 3: return <ArrowUpCircle className="w-4 h-4 text-warning" />;
      default: return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 1: return "Nạp tiền";
      case 2: return "Thanh toán";
      case 3: return "Rút tiền";
      default: return "Khác";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <AppBadge variant="success" className="bg-success/10 text-success text-success border-success/20">Thành công</AppBadge>;
      case 0: return <AppBadge variant="secondary" className="bg-secondary text-muted-foreground border-border">Chờ xử lý</AppBadge>;
      case 2: return <AppBadge variant="destructive" className="bg-error/10 text-error text-error border-error/20">Thất bại</AppBadge>;
      default: return <AppBadge variant="outline">Không rõ</AppBadge>;
    }
  };

    <AppCard appVariant="default" className="border-border shadow-sm overflow-hidden">
      <div className="px-4 pb-2">
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
              header: "Mã giao dịch",
              width: "180px",
              className: "text-left",
              cellClassName: "text-left font-mono text-xs font-bold text-foreground",
              render: (tx) => tx.transactionCode || 'N/A',
            },
            {
              header: "Số tiền",
              width: "140px",
              className: "text-right",
              cellClassName: "text-right font-bold text-foreground",
              render: (tx) => `${tx.amount?.toLocaleString()}đ`,
            },
            {
              header: "Phân loại",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center",
              render: (tx) => (
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
                  {getTypeIcon(tx.type)}
                  {getTypeText(tx.type)}
                </div>
              ),
            },
            {
              header: "Phương thức",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center text-xs text-muted-foreground font-semibold",
              render: (tx) => tx.paymentMethod,
            },
            {
              header: "Trạng thái",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center",
              render: (tx) => getStatusBadge(tx.status),
            },
            {
              header: "Thời gian",
              width: "180px",
              className: "text-center",
              cellClassName: "text-center text-xs text-muted-foreground",
              render: (tx) => tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A",
            },
            {
              header: "Thao tác",
              width: "80px",
              className: "text-center",
              cellClassName: "text-center",
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
      </div>
    </AppCard>
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

  const logs = transaction.log ? JSON.parse(transaction.log) : null;

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
          
          <DetailItem icon={DollarSign} label="Số tiền" value={`${transaction.amount?.toLocaleString()}đ`} />
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
              Trạng thái
            </span>
            <div>
              {transaction.status === 1 ? (
                <AppBadge className="bg-success/10 text-success text-success border-success/20">Thành công</AppBadge>
              ) : (
                <AppBadge variant="secondary">Chờ xử lý / Thất bại</AppBadge>
              )}
            </div>
          </div>

          <DetailItem icon={CreditCard} label="Phương thức" value={transaction.paymentMethod} />
          <DetailItem icon={Calendar} label="Thời gian" value={transaction.createdAt ? format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm:ss") : 'N/A'} />
          
          <div className="col-span-2 h-px bg-secondary my-2"></div>

          <DetailItem icon={Building2} label="Ngân hàng người gửi" value={transaction.senderBankId} />
          <DetailItem icon={User} label="Số tài khoản người gửi" value={transaction.senderAccountNumber} />
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
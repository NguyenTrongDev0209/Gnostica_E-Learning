import React, { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/payment/useTransactions";
import { TransactionHeader } from "@/pages/admin/components/TransactionHeader";
import { TransactionStatsFilter } from "@/pages/admin/components/TransactionStatsFilter";
import { TransactionTable } from "@/pages/admin/components/TransactionTable";
import { TransactionDetailModal } from "@/pages/admin/components/TransactionDetailModal";
import { AppButton } from "@/components/common/micro/AppButton";

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

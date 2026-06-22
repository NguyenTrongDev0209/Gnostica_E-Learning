import React, { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/admin/useTransactions";
import { TransactionHeader } from "@/components/pages/admin/transactions/TransactionHeader";
import { TransactionStatsFilter } from "@/components/pages/admin/transactions/TransactionStatsFilter";
import { TransactionTable } from "@/components/pages/admin/transactions/TransactionTable";
import { TransactionDetailModal } from "@/components/pages/admin/transactions/TransactionDetailModal";
import { Button } from "@/components/ui/button";

export default function AdminTransactions() {
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </Button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <Button 
                  key={pageNumber}
                  variant="outline" 
                  size="sm" 
                  className={`h-8 ${currentPage === pageNumber ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </Button>
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

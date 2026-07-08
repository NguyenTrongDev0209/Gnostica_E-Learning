import React, { useState } from "react";
import { useBanks } from "@/hooks/payment/useBanks";

import { BankHeader } from "@/pages/admin/components/banks/BankHeader";
import { BankStatsFilter } from "@/pages/admin/components/banks/BankStatsFilter";
import { BankTable } from "@/pages/admin/components/banks/BankTable";
import { BankFormModal } from "@/pages/admin/components/banks/BankFormModal";
import { Button } from "@/components/ui/button";

export default function AdminBanks() {
  const { banks, isLoading, addBank, updateBank, removeBank, syncBanks } = useBanks();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBanks = banks.filter((bank) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (bank.shortName?.toLowerCase().includes(searchStr)) ||
      (bank.bankCode?.toLowerCase().includes(searchStr)) ||
      (bank.bin?.toLowerCase().includes(searchStr));
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = bank.status === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanks = filteredBanks.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleAddClick = () => {
    setEditingBank(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (bank) => {
    setEditingBank(bank);
    setIsFormModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingBank) {
      return await updateBank(editingBank.id, data);
    } else {
      return await addBank(data);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <BankHeader 
        onAddClick={handleAddClick} 
        onSyncClick={syncBanks} 
        isSyncing={isLoading} 
      />
      
      <BankStatsFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={banks.length} 
      />
      
      <BankTable 
        banks={paginatedBanks} 
        isLoading={isLoading} 
        onEdit={handleEditClick}
        onDelete={removeBank} 
        startIndex={startIndex}
      />

      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row shadow-sm bg-white rounded-b-xl items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            Hiển thị <span className="font-bold text-foreground">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBanks.length)}</span> trong số <span className="font-bold text-foreground">{filteredBanks.length}</span> ngân hàng
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
      
      <BankFormModal 
        isOpen={isFormModalOpen} 
        onOpenChange={setIsFormModalOpen} 
        onSave={handleSave} 
        editingBank={editingBank}
      />
    </div>
  );
}

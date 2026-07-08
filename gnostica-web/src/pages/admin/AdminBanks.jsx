import React, { useState } from "react";
import { useBanks } from "@/hooks/payment/useBanks";

import { BankHeader } from "@/pages/admin/components/BankHeader";
import { BankStatsFilter } from "@/pages/admin/components/BankStatsFilter";
import { BankTable } from "@/pages/admin/components/BankTable";
import { BankFormModal } from "@/pages/admin/components/BankFormModal";
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
        pagination={{
          currentPage,
          totalPages,
          totalElements: filteredBanks.length,
          onPageChange: setCurrentPage,
          zeroIndexed: false,
        }}
      />


      <BankFormModal 
        isOpen={isFormModalOpen} 
        onOpenChange={setIsFormModalOpen} 
        onSave={handleSave} 
        editingBank={editingBank}
      />
    </div>
  );
}

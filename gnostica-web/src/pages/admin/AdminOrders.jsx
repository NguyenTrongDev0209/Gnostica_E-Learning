import React, { useState, useEffect } from "react";
import { useOrders } from "@/hooks/order/useOrders";
import { OrderHeader } from "@/pages/admin/components/OrderHeader";
import { OrderStatsFilter } from "@/pages/admin/components/OrderStatsFilter";
import { OrderTable } from "@/pages/admin/components/OrderTable";
import { OrderDetailModal } from "@/pages/admin/components/OrderDetailModal";
import { GhostButton, SimpleButton } from "@/components/common/micro/AppButton";

export default function AdminOrders() {
  // eslint-disable-next-line no-unused-vars
  const { orders, isLoading, fetchOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter((order) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.id?.toString().includes(searchStr)) ||
      (order.account?.fullname?.toLowerCase().includes(searchStr)) ||
      (order.account?.email?.toLowerCase().includes(searchStr)) ||
      (order.transactionId?.toLowerCase().includes(searchStr));
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = order.status === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleDetailClick = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <OrderHeader />
      
      <OrderStatsFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={orders.length} 
      />
      
      <OrderTable 
        orders={paginatedOrders} 
        isLoading={isLoading} 
        onDetailClick={handleDetailClick}
        startIndex={startIndex}
      />

      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row shadow-sm bg-white rounded-b-xl items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            Hiển thị <span className="font-bold text-foreground">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> trong số <span className="font-bold text-foreground">{filteredOrders.length}</span> đơn hàng
          </div>
          <div className="flex gap-1">
            <GhostButton 
              size="sm" 
              className="h-8 border border-border" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </GhostButton>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return currentPage === pageNumber ? (
                <SimpleButton 
                  key={pageNumber}
                  size="sm" 
                  className="h-8"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </SimpleButton>
              ) : (
                <GhostButton 
                  key={pageNumber}
                  size="sm" 
                  className="h-8 border border-border bg-white text-muted-foreground hover:bg-muted"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </GhostButton>
              );
            })}

            <GhostButton 
              size="sm" 
              className="h-8 border border-border" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </GhostButton>
          </div>
        </div>
      )}
      
      <OrderDetailModal 
        isOpen={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen} 
        order={selectedOrder} 
      />
    </div>
  );
}

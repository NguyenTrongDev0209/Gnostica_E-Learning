import { useState, useEffect } from "react";

// Mock Data
const ORDERS_DATA = [
  {
    id: "DH-10294",
    date: "15/03/2026",
    courses: [
      { name: "Thiết kế UI/UX Thực chiến với Figma", giftedTo: "minhquoc@gmail.com" }
    ],
    total: "899.000đ",
    method: "VNPay",
    status: "Thành công",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "DH-10182",
    date: "10/01/2026",
    courses: [
      { name: "Lập trình Web Frontend Bootcamp 2026" }, 
      { name: "Mastering React 18" }
    ],
    total: "1.299.000đ",
    method: "Thẻ tín dụng",
    status: "Thành công",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "DH-09871",
    date: "25/12/2025",
    courses: [{ name: "Docker & Kubernetes Bootcamp" }],
    total: "749.000đ",
    method: "Momo",
    status: "Đã hủy",
    statusColor: "bg-error/10 text-error text-error",
  },
];

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchOrders = async () => {
      setLoading(true);
      setTimeout(() => {
        setOrders(ORDERS_DATA);
        setLoading(false);
      }, 800);
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Mock logic for dateRange
    let matchesDate = true;
    if (dateRange?.from) {
      matchesDate = true; // In a real app, parse order.date and compare
    }

    return matchesSearch && matchesDate;
  });

  return { 
    orders: filteredOrders, 
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    totalItems: filteredOrders.length,
    totalPages: Math.ceil(filteredOrders.length / pageSize) || 1
  };
}

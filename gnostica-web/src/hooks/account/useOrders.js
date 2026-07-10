import { useState, useEffect } from "react";

// Mock Data
const ORDERS_DATA = [
  {
    id: "DH-10294",
    date: "15/03/2026",
    courses: ["Thiết kế UI/UX Thực chiến với Figma"],
    total: "899.000đ",
    method: "VNPay",
    status: "Thành công",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "DH-10182",
    date: "10/01/2026",
    courses: ["Lập trình Web Frontend Bootcamp 2026", "Mastering React 18"],
    total: "1.299.000đ",
    method: "Thẻ tín dụng",
    status: "Thành công",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "DH-09871",
    date: "25/12/2025",
    courses: ["Docker & Kubernetes Bootcamp"],
    total: "749.000đ",
    method: "Momo",
    status: "Đã hủy",
    statusColor: "bg-error/10 text-error text-error",
  },
];

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return { orders, loading };
}

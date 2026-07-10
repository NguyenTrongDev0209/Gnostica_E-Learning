import { useState, useEffect } from "react";
import { toast } from "sonner";

// Mock Data
const VOUCHERS_DATA = [
  {
    id: "WELCOME50",
    code: "GNOSTICA50",
    title: "Giảm 50% cho người mới",
    desc: "Áp dụng cho đơn hàng đầu tiên. Không giới hạn giá trị tối đa.",
    expiry: "30/04/2026",
    status: "active",
    discount: "50%",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "MEMBER20",
    code: "MEMBER20",
    title: "Tri ân học viên cũ",
    desc: "Giảm trực tiếp 200.000đ cho các khóa học trên 1.000.000đ.",
    expiry: "15/05/2026",
    status: "active",
    discount: "200K",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "EXPIRED15",
    code: "FLASH15",
    title: "Flash Sale cuối tuần",
    desc: "Giảm 15% cho tất cả khóa học Lập trình.",
    expiry: "01/01/2026",
    status: "expired",
    discount: "15%",
    color: "from-slate-400 to-slate-500",
  },
];

export default function useVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      setTimeout(() => {
        setVouchers(VOUCHERS_DATA);
        setLoading(false);
      }, 600);
    };

    fetchVouchers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}`);
  };

  return {
    vouchers,
    loading,
    handleCopyCode
  };
}

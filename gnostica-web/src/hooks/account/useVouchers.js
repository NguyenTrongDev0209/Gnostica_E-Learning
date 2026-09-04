import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "sonner";
import { API_URL } from "@/config/environment";

export default function useVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/coupons/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const mapped = (data.data || []).map((c, index) => {
            // Randomly assign colors if not from backend
            const colors = [
              "from-blue-500 to-cyan-500",
              "from-orange-500 to-amber-500",
              "from-purple-500 to-fuchsia-500",
              "from-emerald-500 to-teal-500"
            ];
            const color = colors[index % colors.length];
            
            // Format discount text
            let discountText = "";
            if (c.discountType === 1) {
               discountText = `${c.discountValue}%`;
            } else {
               // Assuming discountValue is a number, e.g. 200000 -> 200K
               const val = c.discountValue;
               if (val >= 1000) {
                 discountText = `${val / 1000}K`;
               } else {
                 discountText = `${val}đ`;
               }
            }

            return {
              id: c.id,
              code: c.code,
              title: c.name || "Voucher giảm giá",
              desc: c.maxDiscount != null ? `Giảm tối đa ${Number(c.maxDiscount).toLocaleString()}đ` : "Không giới hạn mức giảm",
              expiry: c.validUntil ? new Date(c.validUntil).toLocaleDateString("vi-VN") : "Không thời hạn",
              status: c.status === 1 ? "active" : "expired",
              discount: discountText,
              color: c.status === 1 ? color : "from-slate-400 to-slate-500",
            };
          });
          setVouchers(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [token]);

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

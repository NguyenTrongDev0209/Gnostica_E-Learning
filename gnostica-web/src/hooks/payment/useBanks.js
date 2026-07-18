import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import bankService from '@/services/payment/bankService';

export function useBanks() {
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBanks = async () => {
    setIsLoading(true);
    try {
      const response = await bankService.getBanks();
      // Backend returns List<Bank> which might be wrapped or direct
      // Based on axios response structure in bankService.js
      if (response) {
        setBanks(response);
      }
    } catch (error) {
      console.error("Failed to fetch banks", error);
      toast.error("Không thể tải danh sách ngân hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const addBank = async (payload) => {
    try {
      await bankService.createBank(payload);
      toast.success("Thêm ngân hàng thành công!");
      await fetchBanks();
      return { success: true };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi thêm ngân hàng.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateBank = async (id, payload) => {
    try {
      await bankService.updateBank(id, payload);
      toast.success("Cập nhật ngân hàng thành công!");
      await fetchBanks();
      return { success: true };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật ngân hàng.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeBank = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ngân hàng này?")) return false;

    try {
      await bankService.deleteBank(id);
      toast.success("Xóa ngân hàng thành công!");
      await fetchBanks();
      return true;
    } catch (error) {
      toast.error("Không thể xóa ngân hàng");
      return false;
    }
  };

  const syncBanks = async () => {
    setIsLoading(true);
    try {
      await bankService.syncBanks();
      toast.success("Đồng bộ ngân hàng thành công!");
      await fetchBanks();
    } catch (error) {
      toast.error("Đồng bộ ngân hàng thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return { banks, isLoading, addBank, updateBank, removeBank, syncBanks, fetchBanks };
}

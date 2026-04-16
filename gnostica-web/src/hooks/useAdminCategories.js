import { useState, useEffect } from "react";
import { toast } from "sonner";
import categoryService from "@/services/categoryService";

/**
 * Hook quản lý logic cho trang AdminCategories.
 * Bao gồm: Fetching, Pagination, Search, CRUD handlers.
 */
export default function useAdminCategories(itemsPerPage = 10) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories(currentPage, itemsPerPage, searchTerm, filterStatus);
      if (response && response.data) {
        setCategories(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Debounced fetch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, filterStatus]);

  const toggleStatus = async (id, newStatus) => {
    try {
      await categoryService.updateStatus(id, newStatus);
      toast.success(`Đã chuyển trạng thái sang ${newStatus ? 'Hoạt động' : 'Tạm ẩn'}`);
      fetchCategories();
      return true;
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return false;

    try {
      await categoryService.deleteCategory(id);
      toast.success("Xóa danh mục thành công!");
      fetchCategories();
      return true;
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message && (message.includes("HAS_CHILDREN") || message.includes("HAS_COURSES"))) {
        const type = message.includes("HAS_CHILDREN") ? "danh mục con" : "khóa học";
        if (window.confirm(`Danh mục này đang chứa ${type}. Bạn không thể xóa để tránh mất dữ liệu.\n\nBạn có muốn chuyển danh mục sang trạng thái 'Tạm ẩn' thay thế không? (Hành động này cũng sẽ ẩn toàn bộ ${type} bên trong)`)) {
          return await toggleStatus(id, false);
        }
      } else {
        toast.error(message || "Lỗi khi xóa danh mục");
      }
      return false;
    }
  };

  const saveCategory = async (editId, data) => {
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id === "none" ? null : parseInt(data.parent_id),
        status: data.status,
      };

      if (editId) {
        await categoryService.updateCategory(editId, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoryService.createCategory(payload);
        toast.success("Thêm danh mục thành công!");
      }
      fetchCategories();
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      toast.error(errorMessage);
      return false;
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return {
    categories,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    expanded,
    setExpanded,
    fetchCategories,
    toggleStatus,
    handleDelete,
    generateSlug,
    saveCategory
  };
}

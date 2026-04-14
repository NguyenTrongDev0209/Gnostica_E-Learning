import { useState, useEffect } from "react";
import categoryService from "@/services/categoryService";

/**
 * Hook để lấy danh sách danh mục cha từ API.
 * @returns {Object} { categories, loading, error }
 */
export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryService.getAllCategories(1, 100, "", "active");
        const cats = res?.content || res?.data?.content || [];
        setCategories(cats);
      } catch (err) {
        console.error("Lỗi load danh mục:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

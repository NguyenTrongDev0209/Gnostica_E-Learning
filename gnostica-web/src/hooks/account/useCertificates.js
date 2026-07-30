import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { API_URL } from "@/config/publicUrl";

export default function useCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/certificates/my-certificates`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data || []).map((c, index) => {
            const colors = [
              "from-orange-500 to-amber-500",
              "from-blue-500 to-cyan-500",
              "from-purple-500 to-fuchsia-500",
              "from-emerald-500 to-teal-500"
            ];
            return {
              id: c.certifiUrl || `CERT-${index}`,
              courseId: index, // dummy if not available
              title: c.courseTitle,
              issueDate: c.completedAt ? new Date(c.completedAt).toLocaleDateString("vi-VN") : "",
              instructor: c.instructorName,
              grade: "Hoàn thành", // No grade available yet
              hours: "---", // No hours available yet
              image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
              color: colors[index % colors.length]
            };
          });
          setCertificates(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [token]);

  return { certificates, loading };
}

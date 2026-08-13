import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { API_URL } from "@/config/environment";

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
              id: c.certificateUrl || `CERT-${index}`,
              courseSlug: c.courseSlug || null,
              courseId: c.courseSlug || index,
              title: c.courseTitle,
              issueDate: c.completedAt ? new Date(c.completedAt).toLocaleDateString("vi-VN") : "",
              instructor: c.instructorName,
              grade: "Hoàn thành",
              totalLessons: c.totalLessons || 0,
              certUrl: c.certificateUrl,
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

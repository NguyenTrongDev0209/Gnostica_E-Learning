import { useState, useEffect } from "react";
import { MOCK_STATS, MOCK_COURSES } from "@/mocks/accountMocks";

export default function useAccountOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: null, recentCourses: [], recentCertificates: [] });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData({
        stats: MOCK_STATS,
        recentCourses: MOCK_COURSES,
        recentCertificates: [
          {
            id: "CERT-2026-891",
            title: "Thi?t k? UI/UX Th?c chi?n v?i Figma",
            issueDate: "15/03/2026",
            image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
          }
        ]
      });
      setLoading(false);
    }, 600);
  }, []);

  return {
    stats: data.stats,
    recentCourses: data.recentCourses,
    recentCertificates: data.recentCertificates,
    loading
  };
}

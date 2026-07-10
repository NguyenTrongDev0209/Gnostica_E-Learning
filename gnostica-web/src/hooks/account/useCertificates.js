import { useState, useEffect } from "react";

// Mock Data
const CERTIFICATES_DATA = [
  {
    id: "CERT-2026-891",
    courseId: 3,
    title: "Thiết kế UI/UX Thực chiến với Figma",
    issueDate: "15/03/2026",
    instructor: "Lê Minh Tâm",
    grade: "Xuất sắc",
    hours: "20.5 giờ",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "CERT-2026-102",
    courseId: 2,
    title: "JavaScript Cơ bản",
    issueDate: "10/01/2026",
    instructor: "Nguyễn Văn A",
    grade: "Giỏi",
    hours: "15 giờ",
    image: "https://images.unsplash.com/photo-1627398242454-4bcf1c8f1d8?q=80&w=400&auto=format&fit=crop",
    color: "from-blue-500 to-cyan-500",
  },
];

export default function useCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchCertificates = async () => {
      setLoading(true);
      setTimeout(() => {
        setCertificates(CERTIFICATES_DATA);
        setLoading(false);
      }, 700);
    };

    fetchCertificates();
  }, []);

  return { certificates, loading };
}

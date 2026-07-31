import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { toast } from 'sonner';
import { API_URL } from '@/config/environment';

export default function useFavoriteInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = useAuthStore(state => state.user?.token);

    const fetchInstructors = async () => {
        if (!token) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/follow/instructors`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const mapped = (data.data || []).map(inst => ({
                    id: inst.instructorId,
                    fullName: inst.instructorName,
                    email: inst.instructorEmail || "",
                    avatar: inst.instructorAvatar || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop",
                    title: inst.instructorTitle || "Giảng viên",
                    coursesCount: inst.totalCourses || 0,
                    studentsCount: inst.totalStudents || 0,
                    rating: inst.rating || 0
                }));
                setInstructors(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch favorite instructors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, [token]);

    const handleUnfollow = async (instructorId) => {
        if (!token) { setLoading(false); return; }
        try {
            const res = await fetch(`${API_URL}/follow/toggle/${instructorId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setInstructors(prev => prev.filter(inst => inst.id !== instructorId));
                toast.success("Đã bỏ theo dõi giảng viên");
            }
        } catch (error) {
            toast.error("Lỗi khi bỏ theo dõi");
        }
    };

    return {
        instructors,
        loading,
        handleUnfollow
    };
}

import { useState, useEffect, useCallback } from 'react';
import followingService from '@/services/instructor/followingService';
import { toast } from 'sonner';

export default function useFavoriteInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFollowedInstructors = useCallback(async () => {
        try {
            setLoading(true);
            const res = await followingService.getFollowedInstructors();
            setInstructors(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách giảng viên theo dõi", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFollowedInstructors();
    }, [fetchFollowedInstructors]);

    const handleUnfollow = async (instructorId) => {
        try {
            const res = await followingService.toggleFollow(instructorId);
            if (!res.data.isFollowing) {
                setInstructors(prev => prev.filter(inst => inst.id !== instructorId));
                toast.success("Đã bỏ theo dõi giảng viên");
            }
        } catch (err) {
            toast.error("Không thể bỏ theo dõi!");
        }
    };

    return {
        instructors,
        loading,
        handleUnfollow
    };
}

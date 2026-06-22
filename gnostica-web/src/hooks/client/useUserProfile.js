import { useState, useEffect } from 'react';
import instructorService from '@/services/instructorService';
import followingService from '@/services/followingService';
import { toast } from 'sonner';

export default function useUserProfile(id, currentUser, isOwnProfile, MOCK_USER) {
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [userData, setUserData] = useState(() => 
    isOwnProfile && currentUser ? { ...MOCK_USER, ...currentUser, name: currentUser.fullName, role: currentUser.role } : MOCK_USER
  );

  // Check following status
  useEffect(() => {
    const checkStatus = async () => {
        if (currentUser && id && !isOwnProfile) {
            try {
                const res = await followingService.checkFollowing(id);
                setFollowing(res.data?.isFollowing || res.isFollowing);
            } catch (err) {
                console.error("Lỗi kiểm tra trạng thái theo dõi", err);
            }
        }
    };
    checkStatus();
  }, [id, currentUser, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
        toast.error("Vui lòng đăng nhập để theo dõi giảng viên!");
        return;
    }
    try {
        setFollowLoading(true);
        const res = await followingService.toggleFollow(id);
        setFollowing(res.data?.isFollowing || res.isFollowing);
        toast.success(res.data?.message || res.message || "Đã cập nhật theo dõi");
    } catch (err) {
        toast.error("Không thể thực hiện thao tác này!");
    } finally {
        setFollowLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnProfile) {
        setLoading(false);
        return;
    }
    
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await instructorService.getInstructorProfile(id);
            setUserData(prev => ({
                ...prev,
                id: data.id,
                name: data.name,
                avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`,
                email: data.email,
                role: "INSTRUCTOR",
                stats: {
                    ...prev.stats,
                    courses: data.coursesCount || 0,
                    students: data.studentsCount || 0,
                }
            }));
            
            setLoadingCourses(true);
            try {
                const coursesData = await instructorService.getInstructorCourses(id);
                setInstructorCourses(coursesData || []);
            } catch (err) {
                console.error("Không thể lấy danh sách khóa học của giảng viên", err);
            } finally {
                setLoadingCourses(false);
            }

        } catch (error) {
            console.error("Không thể lấy thông tin chi tiết user", error);
        } finally {
            setLoading(false);
        }
    };
    
    if (id) fetchUserData();
  }, [id, isOwnProfile]);

  return {
    userData,
    loading,
    following,
    followLoading,
    instructorCourses,
    loadingCourses,
    handleToggleFollow
  };
}

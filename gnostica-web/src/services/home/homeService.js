import { mockPlatformStats, mockInstructors } from '@/mocks/home';

/**
 * Service cho trang chủ (Home Page)
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getPlatformStats = async () => {
    // Giả lập network request
    await delay(500);
    return mockPlatformStats;
};

export const getInstructors = async () => {
    try {
        const response = await axiosClient.get('/instructors/list');
        if (Array.isArray(response.data)) {
            // Map backend response fields to the frontend structure
            return response.data.map(inst => ({
                id: inst.id,
                name: inst.fullName,
                avatar: inst.avatar || `https://i.pravatar.cc/300?u=${inst.email}`,
                role: inst.title || 'Giảng viên',
                students: inst.studentsCount,
                courses: inst.coursesCount
            }));
        }
        return [];
    } catch (error) {
        console.error("Lỗi khi tải danh sách giảng viên từ backend:", error);
        // Trả về dữ liệu mock dự phòng nếu API gặp lỗi
        return mockInstructors;
    }
};

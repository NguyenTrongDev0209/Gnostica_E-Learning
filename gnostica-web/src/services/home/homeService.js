import axiosClient from '@/lib/axiosClient';
import courseService from '@/services/course/courseService';
import categoryService from '@/services/course/categoryService';

const unwrapCategoryPage = (response) => response?.data?.content || response?.content || [];

export const getInstructors = async () => {
    const response = await axiosClient.get('/instructors/list');
    const instructors = Array.isArray(response.data) ? response.data : [];

    return instructors.map((instructor) => ({
        id: instructor.id,
        name: instructor.fullName || instructor.email,
        avatar: instructor.avatar || '/default-avatar.png',
        role: instructor.title || 'Giảng viên',
        students: Number(instructor.studentsCount || 0),
        courses: Number(instructor.coursesCount || 0)
    }));
};

export const getPlatformStats = async () => {
    const [coursePage, instructors, categoryResponse] = await Promise.all([
        courseService.getPublicCourses({ page: 0, size: 1 }),
        getInstructors(),
        categoryService.getAllCategories(1, 1000, '', 'active')
    ]);

    const courseCount = Number(coursePage?.page?.totalElements ?? coursePage?.totalElements ?? 0);
    const studentCount = instructors.reduce((total, instructor) => total + instructor.students, 0);
    const categories = unwrapCategoryPage(categoryResponse);

    return [
        { value: courseCount.toLocaleString('vi-VN'), label: 'Khóa học', iconName: 'BookOpen' },
        { value: studentCount.toLocaleString('vi-VN'), label: 'Lượt học viên', iconName: 'Users' },
        { value: instructors.length.toLocaleString('vi-VN'), label: 'Giảng viên', iconName: 'Award' },
        { value: categories.length.toLocaleString('vi-VN'), label: 'Danh mục', iconName: 'Layers3' }
    ];
};

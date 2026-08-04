import api from '../../config/api';

const enrollmentService = {
    /**
     * Lấy danh sách khóa học đã đăng ký kèm tiến độ mới nhất
     * Response: ApiResponse<List<EnrollmentDTO>>
     */
    getMyCourses: async () => {
        const response = await api.get('/enrollments/my-courses');
        const rawData = response?.data || response;
        const list = Array.isArray(rawData) ? rawData : (rawData?.content || []);
        
        const formatted = list.map(item => {
            const total = item.totalLessons || 0;
            const completedCount = item.completedLessons || 0;

            let percent = 0;
            if (item.progressPercent !== undefined && item.progressPercent !== null) {
                percent = item.progressPercent;
            } else if (item.progress !== undefined && item.progress !== null) {
                percent = item.progress;
            } else if (total > 0) {
                percent = Math.round((completedCount / total) * 100);
            }

            const isDone = !!item.completedAt || percent >= 100 || item.completed || false;

            return {
                ...item,
                id: item.id || item.courseId,
                courseId: item.courseId || item.id,
                title: item.title || item.courseTitle || '',
                courseTitle: item.courseTitle || item.title || '',
                slug: item.slug || item.courseSlug || '',
                courseSlug: item.courseSlug || item.slug || '',
                thumbnail: item.thumbnail || item.courseThumbnail || '',
                courseThumbnail: item.courseThumbnail || item.thumbnail || '',
                progress: percent,
                progressPercent: percent,
                completed: isDone,
                totalLessons: total,
                completedLessons: completedCount,
                lastLesson: item.lastLesson || item.lastWatchedLessonSlug || 'Bài học tiếp theo',
            };
        });

        return { ...response, data: formatted };
    },

    /**
     * Lấy thống kê học tập (số khóa đang học, hoàn thành, giờ học...)
     */
    getStats: () => {
        return api.get('/enrollments/stats');
    },

    /**
     * Kiểm tra user đã enroll khóa học chưa
     * @param {string} courseSlug
     * @returns {{ isEnrolled: boolean }}
     */
    checkEnrollment: (courseSlug) => {
        return api.get(`/enrollments/check/${courseSlug}`);
    },
};

export default enrollmentService;

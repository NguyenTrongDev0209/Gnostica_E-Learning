import api from '../../config/api';

const enrollmentService = {
    /**
     * Láº¥y danh sÃ¡ch khÃ³a há»c Ä‘Ã£ Ä‘Äƒng kÃ½
     * Response: ApiResponse<List<EnrollmentDTO>>
     */
    getMyCourses: async () => {
        const response = await api.get('/enrollments/my-courses');
        const rawData = response?.data || response;
        const list = Array.isArray(rawData) ? rawData : (rawData?.content || []);
        
        const formatted = list.map(item => ({
            ...item,
            id: item.id || item.courseId,
            courseId: item.courseId || item.id,
            title: item.title || item.courseTitle || '',
            courseTitle: item.courseTitle || item.title || '',
            slug: item.slug || item.courseSlug || '',
            courseSlug: item.courseSlug || item.slug || '',
            thumbnail: item.thumbnail || item.courseThumbnail || '',
            courseThumbnail: item.courseThumbnail || item.thumbnail || '',
            progress: item.progress !== undefined ? item.progress : (item.progressPercent ?? 0),
            progressPercent: item.progressPercent !== undefined ? item.progressPercent : (item.progress ?? 0),
            completed: !!item.completedAt || item.progress === 100 || item.progressPercent === 100 || item.completed || false,
            lastLesson: item.lastLesson || item.lastWatchedLessonSlug || 'Bài học tiếp theo',
        }));

        return { ...response, data: formatted };
    },

    /**
     * Láº¥y thá»‘ng kÃª há»c táº­p (sá»‘ khÃ³a Ä‘ang há»c, hoÃ n thÃ nh, giá» há»c...)
     */
    getStats: () => {
        return api.get('/enrollments/stats');
    },

    /**
     * Kiá»ƒm tra user Ä‘Ã£ enroll khÃ³a há»c chÆ°a
     * @param {string} courseSlug
     * @returns {{ isEnrolled: boolean }}
     */
    checkEnrollment: (courseSlug) => {
        return api.get(`/enrollments/check/${courseSlug}`);
    },
};

export default enrollmentService;


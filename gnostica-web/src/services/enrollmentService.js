import api from "./api";

const RESOURCE_PATH = "/enrollments";

const enrollmentService = {
  getMyCourses: async () => {
    const response = await api.get(`${RESOURCE_PATH}/my-courses`);
    return response.data;
  },

  checkEnrollment: async (courseSlug) => {
    const response = await api.get(`${RESOURCE_PATH}/check/${courseSlug}`);
    return response.data;
  },
};

export default enrollmentService;

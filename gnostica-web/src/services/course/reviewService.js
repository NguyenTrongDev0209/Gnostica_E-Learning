import axiosClient from "@/lib/axiosClient";

export const reviewService = {
  submitReview: async (courseSlug, rating, comment) => {
    const response = await axiosClient.post("/reviews", { courseSlug, rating, comment });
    return response.data;
  },

  replyToReview: async (parentReviewId, comment) => {
    const response = await axiosClient.post("/reviews/reply", { parentReviewId, comment });
    return response.data;
  },

  getCourseReviews: async (courseSlug) => {
    const response = await axiosClient.get(`/reviews/course/${courseSlug}`);
    return response.data;
  },
};

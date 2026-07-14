import { mockPlatformStats, mockInstructors } from '@/mocks/home';

/**
 * Service mock cho trang chủ (Home Page)
 * Giả lập API delay
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getPlatformStats = async () => {
    // Giả lập network request
    await delay(500);
    return mockPlatformStats;
};

export const getInstructors = async () => {
    // Giả lập network request
    await delay(600);
    return mockInstructors;
};

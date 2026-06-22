import axiosClient from '@/lib/axiosClient';

const API_URL = '/account';

const updateAvatar = async (email, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', email);

        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;

        const response = await axiosClient.post(`${API_URL}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });
        
        // Cập nhật lại avatar trong localStorage nếu thành công
        if (response.data.status === 200) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.avatar = response.data.data.avatarUrl;
                localStorage.setItem('user', JSON.stringify(user));
            }
        }
        
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Không thể cập nhật ảnh đại diện!';
    }
};

const accountService = {
    updateAvatar,
    updatePersonalization: async (email, data) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await axios.put(`${API_URL}/personalization?email=${email}`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.status === 200) {
                // Update local user state
                if (user) {
                    user.onboardingCompleted = true;
                    // You might want to save level/categories too if needed in frontend
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Không thể cập nhật thông tin cá nhân hóa!';
        }
    }
};

export default accountService;

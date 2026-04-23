import axios from 'axios';

const API_URL = 'http://localhost:8080/api/account';

const updateAvatar = async (email, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', email);

        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;

        const response = await axios.post(`${API_URL}/avatar`, formData, {
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
};

export default accountService;

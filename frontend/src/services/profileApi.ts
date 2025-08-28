import api from './api';
import type { ProfileUpdateData, PasswordChangeData } from '../types/auth';

export const profileApi = {
  // Lấy thông tin profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Cập nhật thông tin profile
  updateProfile: async (data: ProfileUpdateData) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  // Cập nhật avatar
  updateAvatar: async (file: File) => {
    console.log('profileApi.updateAvatar called with file:', file);
    const formData = new FormData();
    formData.append('avatar', file);
    
    console.log('FormData created:', formData);
    
    try {
      const response = await api.put('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Avatar update response:', response);
      return response.data;
    } catch (error) {
      console.error('Avatar update API error:', error);
      throw error;
    }
  },

  // Thay đổi mật khẩu
  changePassword: async (data: PasswordChangeData) => {
    const response = await api.put('/profile/password', data);
    return response.data;
  },
};

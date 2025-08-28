import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markAsRead = async (id: string) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const getNotificationCount = async () => {
  const res = await api.get('/notifications/count');
  return res.data.count;
}; 
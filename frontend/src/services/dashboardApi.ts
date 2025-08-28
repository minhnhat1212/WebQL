import api from './api';

export const getMyProjects = async () => {
  const res = await api.get('/projects');
  return res.data;
};

export const getMyTasksNearDeadline = async () => {
  const today = new Date();
  const to = new Date();
  to.setDate(today.getDate() + 7); // 7 ngày tới
  const res = await api.get('/search/tasks/filter', {
    params: {
      from: today.toISOString(),
      to: to.toISOString(),
    },
  });
  return res.data;
};

export const getMyNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
}; 
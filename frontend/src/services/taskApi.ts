import api from './api';

export const getTasks = async (params?: any) => {
  // Nếu có filter theo project, gọi API theo project
  if (params && params.project) {
    const res = await api.get(`/tasks/project/${params.project}`, { params });
    return res.data;
  }
  
  // Nếu không có filter, lấy tất cả task
  const res = await api.get('/tasks', { params });
  return res.data;
};

export const createTask = async (data: any) => {
  const res = await api.post('/tasks', data);
  return res.data;
};

export const updateTask = async (id: string, data: any) => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id: string) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};

export const getTaskCount = async () => {
  const res = await api.get('/tasks/count');
  return res.data.count;
}; 
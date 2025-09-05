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

// Enhanced APIs
export const addSubtask = async (taskId: string, data: any) => {
  const res = await api.post(`/tasks/${taskId}/subtasks`, data);
  return res.data;
};

export const updateChecklist = async (taskId: string, checklist: any[]) => {
  const res = await api.put(`/tasks/${taskId}/checklist`, { checklist });
  return res.data;
};

export const toggleChecklistItem = async (taskId: string, itemId: string, done?: boolean) => {
  const res = await api.post(`/tasks/${taskId}/checklist/toggle`, { itemId, done });
  return res.data;
};

export const recalculateProgress = async (taskId: string) => {
  const res = await api.post(`/tasks/${taskId}/recalculate-progress`);
  return res.data;
};

export const startTimer = async (taskId: string) => {
  const res = await api.post(`/tasks/${taskId}/timer/start`);
  return res.data;
};

export const stopTimer = async (taskId: string) => {
  const res = await api.post(`/tasks/${taskId}/timer/stop`);
  return res.data;
};

export const addTimeEntry = async (taskId: string, data: any) => {
  const res = await api.post(`/tasks/${taskId}/time-entries`, data);
  return res.data;
};

export const getTimeReport = async (params: { projectId?: string; userId?: string; from?: string; to?: string }) => {
  const res = await api.get('/tasks/time-report', { params });
  return res.data;
};

export const generateRecurring = async (taskId: string) => {
  const res = await api.post(`/tasks/${taskId}/generate-recurring`);
  return res.data;
};
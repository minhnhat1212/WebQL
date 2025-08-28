import api from './api';

export const getTaskDetail = async (id: string) => {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
};

export const updateTaskDetail = async (id: string, data: any) => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
};

export const getComments = async (taskId: string) => {
  const res = await api.get(`/comments/task/${taskId}`);
  return res.data;
};

export const addComment = async (taskId: string, content: string) => {
  const res = await api.post('/comments', { taskId, content });
  return res.data;
};

// Upload nhiều file đính kèm cho task
export const uploadFiles = async (taskId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  const res = await api.post(`/tasks/${taskId}/upload-files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}; 
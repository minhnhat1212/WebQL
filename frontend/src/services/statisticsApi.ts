import api from './api';

export const getProjectProgress = async () => {
  const res = await api.get('/statistics/project-progress');
  return res.data;
};

export const getTaskStatusByProject = async (projectId: string) => {
  const res = await api.get(`/statistics/task-status/${projectId}`);
  return res.data;
};

export const getMemberProgressByProject = async (projectId: string) => {
  const res = await api.get(`/statistics/member-progress/${projectId}`);
  return res.data;
}; 
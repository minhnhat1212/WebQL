import api from './api';

export const getMembers = async (projectId: string) => {
  const res = await api.get(`/members/${projectId}`);
  return res.data;
};

export const addMember = async (projectId: string, userId: string) => {
  const res = await api.post(`/members/${projectId}/add`, { userId });
  return res.data;
};

export const removeMember = async (projectId: string, userId: string) => {
  const res = await api.post(`/members/${projectId}/remove`, { userId });
  return res.data;
};

export const changeLeader = async (projectId: string, newLeaderId: string) => {
  const res = await api.post(`/members/${projectId}/change-leader`, { newLeaderId });
  return res.data;
}; 
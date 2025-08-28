import api from './api';

export const getTasksByDay = async (date: string) => {
  const res = await api.get('/calendar/day', { params: { date } });
  return res.data;
};

export const getTasksByWeek = async (start: string, end: string) => {
  const res = await api.get('/calendar/week', { params: { start, end } });
  return res.data;
};

export const getTasksByMonth = async (year: number, month: number) => {
  const res = await api.get('/calendar/month', { params: { year, month } });
  return res.data;
};

export const getCalendarCount = async () => {
  const res = await api.get('/calendar/count');
  return res.data.count;
}; 
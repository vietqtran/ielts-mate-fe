import axios from '../axios';

export const fetchAllListeningTasksForCreator = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  title?: string;
}) => {
  const res = await axios.get('/listening/tasks/creator', { params });
  return res.data.data;
};

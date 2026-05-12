import api from './axios';

export const getSummary = () => api.get('/analytics/summary');

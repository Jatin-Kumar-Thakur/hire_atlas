import api from './axios';

export const getApplications    = (params)       => api.get('/applications',              { params });
export const createApplication  = (data)         => api.post('/applications',             data);
export const getApplicationById = (id)           => api.get(`/applications/${id}`);
export const updateApplication  = (id, data)     => api.put(`/applications/${id}`,        data);
export const deleteApplication  = (id)           => api.delete(`/applications/${id}`);
export const getStats           = ()             => api.get('/applications/stats');

// Interview rounds
export const addInterviewRound    = (appId, data)           => api.post(`/applications/${appId}/rounds`,              data);
export const updateInterviewRound = (appId, roundId, data)  => api.put(`/applications/${appId}/rounds/${roundId}`,    data);
export const deleteInterviewRound = (appId, roundId)        => api.delete(`/applications/${appId}/rounds/${roundId}`);

// CSV export — triggers browser download automatically
export const exportApplications = async (filters = {}) => {
  const response = await api.get('/applications/export', {
    params: filters,
    responseType: 'blob',
  });
  const url  = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `applications-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// CSV import
export const importApplications = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/applications/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

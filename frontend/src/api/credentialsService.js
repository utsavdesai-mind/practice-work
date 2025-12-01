import api from "./axiosConfig";

export const getCredentials = (params) => api.get("/credentials", { params });
export const getCredentialById = (id) => api.get(`/credentials/${id}`);
export const createCredential = (data) => api.post("/credentials", data);
export const updateCredential = (id, data) => api.put(`/credentials/${id}`, data);
export const deleteCredential = (id) => api.delete(`/credentials/${id}`);
export const shareCredential = (id, data) => api.post(`/credentials/${id}/share`, data);
export const accessSharedCredential = (shareToken) => api.get(`/credentials/access/${shareToken}`);

export default {
  getCredentials,
  getCredentialById,
  createCredential,
  updateCredential,
  deleteCredential,
  shareCredential,
  accessSharedCredential,
};

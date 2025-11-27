import api from "./axiosConfig";

export const getRoles = (params) => api.get("/roles", { params });
export const getRoleById = (id) => api.get(`/roles/${id}`);
export const createRole = (data) => api.post("/roles", data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}`);
export const assignPermissions = (id, data) => api.post(`/roles/assign-permission/${id}`, data);
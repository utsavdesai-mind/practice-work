import api from "./axiosConfig";

export const getUsers = (params) => api.get("/users", { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const inviteUser = (id) => api.post(`/users/invite/${id}`);
export const acceptInvitation = (data) => api.post("/users/accept-invitation", data);
export const createPassword = (data) => api.post("/users/create-password", data);
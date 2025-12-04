import api from "./axiosConfig";

export const getPermissions = () => api.get("/permissions");
export const getPermissionsByRole = (roleId) => api.get(`/permissions/role/${roleId}`);
import api from "./axiosConfig";

export const getPermissions = () => api.get("/permissions");
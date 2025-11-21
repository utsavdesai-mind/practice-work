import api from "./axiosConfig";

export const getAllUsers = () => api.get("/users");

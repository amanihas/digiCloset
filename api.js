import axios from "axios";

// Replace with your computer IP and port if using Expo on phone
export const API_BASE = "http://192.168.1.220:5000/api";

const API = axios.create({
  baseURL: API_BASE,
});

// auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// protected clothing routes (pass token)
export const fetchClothes = (token) =>
  API.get("/clothes", { headers: { Authorization: `Bearer ${token}` } });

export const createClothing = (token, payload) =>
  API.post("/clothes", payload, { headers: { Authorization: `Bearer ${token}` } });

export const updateClothing = (token, id) =>
  API.put(`/clothes/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const deleteClothing = (token, id) =>
  API.delete(`/clothes/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default API;

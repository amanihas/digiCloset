import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.220:5000/api", // ⚠️ replace with your local IP if needed
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

export const fetchClothes = (token) =>
  API.get("/clothes", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addClothing = (token, item) =>
  API.post("/clothes", item, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default API;

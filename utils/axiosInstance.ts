import axios from "axios";
import { BACKEND_API_KEY } from "./ApiKey";

const api = axios.create({
  baseURL: "https://packarma.shellcode.cloud",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || "";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect the user to the login page
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;

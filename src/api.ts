import axios from "axios";

// Use the environment variable if defined, otherwise default to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000",
});

export default api;

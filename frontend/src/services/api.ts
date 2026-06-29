import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

export const authService = {
  login: () => { window.location.href = "/auth/login"; },
  logout: () => api.post("/auth/logout"),
  getStatus: () => api.get("/auth/status"),
};

export const analysisService = {
  getProfile: () => api.get("/api/analysis/profile"),
  createPlaylist: (payload: {
    name: string;
    description?: string;
    trackUris: string[];
    public?: boolean;
  }) => api.post("/api/analysis/create-playlist", payload),
};

export default api;

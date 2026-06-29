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
  createStudyPlaylist: (payload: {
    seedTrackIds: string[];
    playlistParams: {
      targetEnergy: number;
      targetValence: number;
      targetTempo: number;
      minInstrumentalness: number;
    };
    playlistName?: string;
  }) => api.post("/api/analysis/playlist/study", payload),
};

export default api;

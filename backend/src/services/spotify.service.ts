import axios, { AxiosInstance } from "axios";
import { config } from "../config";
import type { SpotifyTokens, SpotifyUser, SpotifyTrack, SpotifyArtist, AudioFeatures } from "../types/spotify";

type TimeRange = "short_term" | "medium_term" | "long_term";

const ACCOUNTS = "https://accounts.spotify.com";
const API = "https://api.spotify.com/v1";

export const getAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.spotify.clientId,
    scope: config.spotify.scopes,
    redirect_uri: config.spotify.redirectUri,
    state,
    show_dialog: "true",
  });
  return `${ACCOUNTS}/authorize?${params}`;
};

export const exchangeCode = async (code: string): Promise<SpotifyTokens> => {
  const creds = Buffer.from(`${config.spotify.clientId}:${config.spotify.clientSecret}`).toString("base64");
  const { data } = await axios.post<SpotifyTokens>(
    `${ACCOUNTS}/api/token`,
    new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: config.spotify.redirectUri }).toString(),
    { headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<SpotifyTokens> => {
  const creds = Buffer.from(`${config.spotify.clientId}:${config.spotify.clientSecret}`).toString("base64");
  const { data } = await axios.post<SpotifyTokens>(
    `${ACCOUNTS}/api/token`,
    new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }).toString(),
    { headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return { ...data, refresh_token: data.refresh_token || refreshToken };
};

const client = (token: string): AxiosInstance =>
  axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });

export const getMe = async (token: string): Promise<SpotifyUser> =>
  (await client(token).get<SpotifyUser>("/me")).data;

export const getTopTracks = async (token: string, timeRange: TimeRange = "medium_term", limit = 50): Promise<SpotifyTrack[]> =>
  (await client(token).get<{ items: SpotifyTrack[] }>("/me/top/tracks", { params: { time_range: timeRange, limit } })).data.items;

export const getTopArtists = async (token: string, timeRange: TimeRange = "medium_term", limit = 20): Promise<SpotifyArtist[]> =>
  (await client(token).get<{ items: SpotifyArtist[] }>("/me/top/artists", { params: { time_range: timeRange, limit } })).data.items;

export const getRecentlyPlayed = async (token: string, limit = 50): Promise<SpotifyTrack[]> => {
  const { data } = await client(token).get<{ items: { track: SpotifyTrack; played_at: string }[] }>(
    "/me/player/recently-played",
    { params: { limit } }
  );
  return data.items.map((i) => i.track);
};

export const getAudioFeatures = async (token: string, trackIds: string[]): Promise<AudioFeatures[]> => {
  if (!trackIds.length) return [];
  const results: AudioFeatures[] = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    const batch = trackIds.slice(i, i + 100);
    const { data } = await client(token).get<{ audio_features: (AudioFeatures | null)[] }>(
      "/audio-features",
      { params: { ids: batch.join(",") } }
    );
    results.push(...data.audio_features.filter((f): f is AudioFeatures => f !== null));
  }
  return results;
};

export const createSpotifyPlaylist = async (
  token: string,
  userId: string,
  name: string,
  description: string,
  isPublic: boolean
): Promise<{ id: string; external_urls: { spotify: string } }> => {
  const { data } = await client(token).post(`/users/${userId}/playlists`, {
    name,
    description,
    public: isPublic,
  });
  return data;
};

export const addTracksToPlaylist = async (
  token: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> => {
  for (let i = 0; i < trackUris.length; i += 100) {
    await client(token).post(`/playlists/${playlistId}/tracks`, { uris: trackUris.slice(i, i + 100) });
  }
};

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

export const getRecentlyPlayed = async (token: string, limit = 50): Promise<(SpotifyTrack & { played_at: string })[]> => {
  const { data } = await client(token).get<{ items: { track: SpotifyTrack; played_at: string }[] }>(
    "/me/player/recently-played",
    { params: { limit } }
  );
  return data.items.map((i) => ({ ...i.track, played_at: i.played_at }));
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

export interface RecommendationParams {
  seed_artists?: string[];
  seed_tracks?: string[];
  seed_genres?: string[];
  target_energy?: number;
  target_valence?: number;
  target_tempo?: number;
  min_energy?: number;
  max_energy?: number;
  min_valence?: number;
  max_valence?: number;
  min_tempo?: number;
  max_tempo?: number;
  limit?: number;
}

export const getRecommendations = async (
  token: string,
  params: RecommendationParams
): Promise<SpotifyTrack[]> => {
  const query: Record<string, string> = {};
  if (params.seed_artists?.length) query.seed_artists = params.seed_artists.slice(0, 3).join(",");
  if (params.seed_tracks?.length)  query.seed_tracks  = params.seed_tracks.slice(0, 2).join(",");
  if (params.seed_genres?.length)  query.seed_genres  = params.seed_genres.slice(0, 2).join(",");
  if (params.target_energy  != null) query.target_energy  = String(params.target_energy);
  if (params.target_valence != null) query.target_valence = String(params.target_valence);
  if (params.target_tempo   != null) query.target_tempo   = String(params.target_tempo);
  if (params.min_energy     != null) query.min_energy     = String(params.min_energy);
  if (params.max_energy     != null) query.max_energy     = String(params.max_energy);
  if (params.min_valence    != null) query.min_valence    = String(params.min_valence);
  if (params.max_valence    != null) query.max_valence    = String(params.max_valence);
  if (params.min_tempo      != null) query.min_tempo      = String(params.min_tempo);
  if (params.max_tempo      != null) query.max_tempo      = String(params.max_tempo);
  query.limit = String(Math.min(params.limit ?? 50, 100));

  const { data } = await client(token).get<{ tracks: SpotifyTrack[] }>("/recommendations", { params: query });
  return data.tracks;
};

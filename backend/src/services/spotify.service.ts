import axios, { AxiosInstance } from "axios";
import { config } from "../config";
import type { SpotifyTokens, SpotifyUser, SpotifyTrack, SpotifyArtist } from "../types/spotify";

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

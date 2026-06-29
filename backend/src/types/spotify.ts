export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  followers: { total: number };
  country: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  uri: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: Array<{ url: string }>;
}

export interface AudioFeatures {
  id: string;
  tempo: number;         // BPM
  energy: number;        // 0.0 - 1.0
  valence: number;       // 0.0 - 1.0 (mood: sad → happy)
  danceability: number;  // 0.0 - 1.0
  acousticness: number;  // 0.0 - 1.0
  instrumentalness: number;
  loudness: number;      // dB
  speechiness: number;
  time_signature: number;
  key: number;
  mode: number;
  liveness: number;
  duration_ms: number;
}

export interface EnrichedTrack extends SpotifyTrack {
  audioFeatures?: AudioFeatures;
}

export interface UserProfile {
  user: SpotifyUser;
  topTracks: {
    short_term: SpotifyTrack[];
    medium_term: SpotifyTrack[];
    long_term: SpotifyTrack[];
  };
  topArtists: {
    short_term: SpotifyArtist[];
    medium_term: SpotifyArtist[];
    long_term: SpotifyArtist[];
  };
  audioFeatures: AudioFeatures[];
}

export interface PlaylistRequest {
  name: string;
  description?: string;
  trackUris: string[];
  public?: boolean;
}

declare module "express-session" {
  interface SessionData {
    spotifyTokens?: SpotifyTokens;
    tokenExpiry?: number;
    state?: string;
    userId?: string;
  }
}

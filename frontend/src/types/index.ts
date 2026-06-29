export interface AudioStats {
  avgTempo: number;
  avgEnergy: number;
  avgValence: number;
  avgDanceability: number;
  avgAcousticness: number;
  avgInstrumentalness: number;
  tempoOverTime: Array<{ trackName: string; tempo: number; index: number }>;
  moodGenreMatrix: Array<{
    trackName: string;
    valence: number;
    energy: number;
    genre: string;
    trackId: string;
  }>;
}

export interface CharacterProfile {
  archetype: string;
  description: string;
  stats: AudioStats;
  studyPlaylistParams: {
    targetEnergy: number;
    targetValence: number;
    targetTempo: number;
    minInstrumentalness: number;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

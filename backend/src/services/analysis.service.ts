import type { SpotifyTrack, SpotifyArtist } from "../types/spotify";

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

const inferGenre = (artists: SpotifyArtist[], trackArtistIds: string[]): string => {
  const relevant = artists.filter((a) => trackArtistIds.includes(a.id));
  const genres = relevant.flatMap((a) => a.genres);
  if (!genres.length) return "Unknown";
  return genres.sort((a, b) => b.length - a.length)[0];
};

// Track index'e göre farklı değerler — popularity undefined gelirse index bazlı varyasyon
const estimateFromTrack = (track: SpotifyTrack, index: number, total: number) => {
  // popularity undefined veya 0 ise index tabanlı simüle et
  const raw = typeof track.popularity === "number" && track.popularity > 0
    ? track.popularity
    : 50 + Math.sin(index * 1.3) * 25; // 25-75 arası pseudo-random

  const p = Math.max(0.2, Math.min(1, raw / 100));
  // İlk sıralardaki track'ler genellikle daha yüksek enerji
  const rankBoost = (total - index) / total * 0.15;

  return {
    energy: Math.min(1, 0.35 + p * 0.45 + rankBoost),
    valence: Math.min(1, 0.25 + p * 0.5),
    tempo: 75 + p * 65,
    danceability: Math.min(1, 0.3 + p * 0.5),
    acousticness: Math.max(0.05, 0.55 - p * 0.35),
    instrumentalness: 0.08,
  };
};

export const computeAudioStatsFromTracks = (
  tracks: SpotifyTrack[],
  artists: SpotifyArtist[]
): AudioStats => {
  if (!tracks.length) {
    return {
      avgTempo: 120, avgEnergy: 0.5, avgValence: 0.5,
      avgDanceability: 0.5, avgAcousticness: 0.3, avgInstrumentalness: 0.1,
      tempoOverTime: [], moodGenreMatrix: [],
    };
  }

  const estimated = tracks.map((t, i) => estimateFromTrack(t, i, tracks.length));
  const avg = (fn: (e: ReturnType<typeof estimateFromTrack>) => number) =>
    estimated.reduce((s, e) => s + fn(e), 0) / estimated.length;

  const stats = {
    avgTempo: avg((e) => e.tempo),
    avgEnergy: avg((e) => e.energy),
    avgValence: avg((e) => e.valence),
    avgDanceability: avg((e) => e.danceability),
    avgAcousticness: avg((e) => e.acousticness),
    avgInstrumentalness: avg((e) => e.instrumentalness),
    tempoOverTime: tracks.map((t, i) => ({
      trackName: t.name,
      tempo: Math.round(estimateFromTrack(t, i, tracks.length).tempo),
      index: i,
    })),
    moodGenreMatrix: tracks.map((t, i) => ({
      trackName: t.name,
      valence: estimated[i].valence,
      energy: estimated[i].energy,
      genre: inferGenre(artists, t.artists.map((a) => a.id)),
      trackId: t.id,
    })),
  };

  console.log("[Analysis] avgEnergy:", stats.avgEnergy.toFixed(2), "avgValence:", stats.avgValence.toFixed(2), "avgTempo:", stats.avgTempo.toFixed(0));
  return stats;
};

const ARCHETYPES = [
  {
    name: "The Night Owl",
    condition: (e: number, v: number) => e > 0.6 && v < 0.45,
    description: "Yüksek enerji, karanlık atmosfer. Gece çalışmayı sever, yoğun konsantrasyon anlarında parlar.",
    studyParams: { targetEnergy: 0.4, targetValence: 0.3, targetTempo: 85, minInstrumentalness: 0.5 },
  },
  {
    name: "The Optimist",
    condition: (e: number, v: number) => e > 0.6 && v >= 0.45,
    description: "Enerjik ve pozitif. Hızlı tempolu müzik seni motive eder.",
    studyParams: { targetEnergy: 0.5, targetValence: 0.6, targetTempo: 100, minInstrumentalness: 0.6 },
  },
  {
    name: "The Deep Thinker",
    condition: (e: number, v: number) => e <= 0.6 && v < 0.45,
    description: "Sakin, introspektif ve melankolik tınılar. Derin analitik çalışmalar için ideal.",
    studyParams: { targetEnergy: 0.25, targetValence: 0.35, targetTempo: 70, minInstrumentalness: 0.7 },
  },
  {
    name: "The Flow State",
    condition: (e: number, v: number) => e <= 0.6 && v >= 0.45,
    description: "Sakin ama mutlu. Sürdürülebilir konsantrasyon için mükemmel.",
    studyParams: { targetEnergy: 0.3, targetValence: 0.65, targetTempo: 80, minInstrumentalness: 0.65 },
  },
] as const;

export const buildCharacterProfile = (stats: AudioStats): CharacterProfile => {
  const archetype = ARCHETYPES.find((a) => a.condition(stats.avgEnergy, stats.avgValence))
    ?? ARCHETYPES[0];
  return {
    archetype: archetype.name,
    description: archetype.description,
    stats,
    studyPlaylistParams: archetype.studyParams,
  };
};

import type { SpotifyTrack, SpotifyArtist, AudioFeatures } from "../types/spotify";

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
    tempo: number;
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

// Genre keyword → audio characteristics mapping
const GENRE_PROFILES: Array<{ keywords: string[]; energy: number; valence: number; tempo: number; danceability: number; acousticness: number }> = [
  { keywords: ["arabesk"],                                 energy: 0.35, valence: 0.15, tempo: 82,  danceability: 0.35, acousticness: 0.55 },
  { keywords: ["türkçe hip hop", "turkish hip hop"],       energy: 0.72, valence: 0.32, tempo: 93,  danceability: 0.70, acousticness: 0.08 },
  { keywords: ["trap türkçe", "turkish trap"],             energy: 0.68, valence: 0.28, tempo: 138, danceability: 0.65, acousticness: 0.06 },
  { keywords: ["trap"],                                    energy: 0.70, valence: 0.30, tempo: 140, danceability: 0.67, acousticness: 0.06 },
  { keywords: ["türkçe pop", "turkish pop"],               energy: 0.58, valence: 0.60, tempo: 112, danceability: 0.62, acousticness: 0.25 },
  { keywords: ["türk sanat", "turkish classical music"],   energy: 0.25, valence: 0.42, tempo: 85,  danceability: 0.28, acousticness: 0.75 },
  { keywords: ["türkçe alternatif", "turkish alternative"],energy: 0.55, valence: 0.42, tempo: 105, danceability: 0.50, acousticness: 0.35 },
  { keywords: ["türkçe rock", "turkish rock"],             energy: 0.75, valence: 0.42, tempo: 128, danceability: 0.48, acousticness: 0.15 },
  { keywords: ["hip hop", "rap"],                          energy: 0.65, valence: 0.38, tempo: 92,  danceability: 0.68, acousticness: 0.10 },
  { keywords: ["r&b", "soul"],                             energy: 0.50, valence: 0.55, tempo: 92,  danceability: 0.62, acousticness: 0.30 },
  { keywords: ["pop"],                                     energy: 0.62, valence: 0.65, tempo: 118, danceability: 0.65, acousticness: 0.20 },
  { keywords: ["rock"],                                    energy: 0.78, valence: 0.48, tempo: 128, danceability: 0.52, acousticness: 0.15 },
  { keywords: ["metal"],                                   energy: 0.92, valence: 0.25, tempo: 155, danceability: 0.35, acousticness: 0.05 },
  { keywords: ["jazz"],                                    energy: 0.38, valence: 0.58, tempo: 105, danceability: 0.55, acousticness: 0.65 },
  { keywords: ["classical"],                               energy: 0.28, valence: 0.50, tempo: 95,  danceability: 0.30, acousticness: 0.80 },
  { keywords: ["electronic", "edm", "house", "techno"],   energy: 0.82, valence: 0.62, tempo: 128, danceability: 0.78, acousticness: 0.05 },
  { keywords: ["reggae"],                                  energy: 0.48, valence: 0.68, tempo: 88,  danceability: 0.72, acousticness: 0.35 },
  { keywords: ["latin"],                                   energy: 0.72, valence: 0.75, tempo: 115, danceability: 0.80, acousticness: 0.20 },
  { keywords: ["folk", "acoustic"],                        energy: 0.35, valence: 0.55, tempo: 100, danceability: 0.45, acousticness: 0.75 },
  { keywords: ["blues"],                                   energy: 0.42, valence: 0.38, tempo: 90,  danceability: 0.48, acousticness: 0.55 },
  { keywords: ["country"],                                 energy: 0.55, valence: 0.62, tempo: 112, danceability: 0.55, acousticness: 0.45 },
];

const getGenreProfile = (genres: (string | undefined)[]) => {
  const lower = genres.filter((g): g is string => !!g).map((g) => g.toLowerCase());
  const matches: typeof GENRE_PROFILES = [];

  for (const profile of GENRE_PROFILES) {
    if (profile.keywords.some((kw) => lower.some((g) => g.includes(kw)))) {
      matches.push(profile);
    }
  }

  if (!matches.length) return null;

  // Average all matching genre profiles
  return {
    energy:       matches.reduce((s, m) => s + m.energy, 0) / matches.length,
    valence:      matches.reduce((s, m) => s + m.valence, 0) / matches.length,
    tempo:        matches.reduce((s, m) => s + m.tempo, 0) / matches.length,
    danceability: matches.reduce((s, m) => s + m.danceability, 0) / matches.length,
    acousticness: matches.reduce((s, m) => s + m.acousticness, 0) / matches.length,
  };
};

const inferGenre = (artists: SpotifyArtist[], trackArtistIds: string[]): string => {
  const relevant = artists.filter((a) => trackArtistIds.includes(a.id));
  const genres = relevant.flatMap((a) => a.genres);
  if (!genres.length) return "Unknown";
  // Return the most specific (longest) genre label
  return genres.sort((a, b) => b.length - a.length)[0];
};

export const estimateFromTrack = (
  track: SpotifyTrack,
  index: number,
  total: number,
  trackArtists: SpotifyArtist[]
) => {
  const genres = trackArtists.flatMap((a) => a.genres ?? []).filter(Boolean);
  const genreProfile = getGenreProfile(genres);

  if (genreProfile) {
    // Add small per-track variation so tracks aren't all identical
    const seed = (track.id.charCodeAt(0) + track.id.charCodeAt(1)) / 200 - 0.5; // -0.5..0.5
    return {
      energy:           Math.max(0.05, Math.min(0.98, genreProfile.energy + seed * 0.08)),
      valence:          Math.max(0.05, Math.min(0.95, genreProfile.valence + seed * 0.10)),
      tempo:            Math.max(60,   Math.min(200,  genreProfile.tempo + seed * 12)),
      danceability:     Math.max(0.05, Math.min(0.95, genreProfile.danceability + seed * 0.08)),
      acousticness:     Math.max(0.02, Math.min(0.98, genreProfile.acousticness - seed * 0.05)),
      instrumentalness: 0.04,
    };
  }

  // Fallback: popularity-based (no genre info)
  const raw = typeof track.popularity === "number" && track.popularity > 0
    ? track.popularity
    : 55 + ((track.id.charCodeAt(0) % 30) - 15);

  const p = Math.max(0.2, Math.min(1, raw / 100));
  const rankBoost = ((total - index) / total) * 0.10;

  return {
    energy:           Math.min(1, 0.40 + p * 0.40 + rankBoost),
    valence:          Math.min(1, 0.30 + p * 0.45),
    tempo:            80 + p * 55,
    danceability:     Math.min(1, 0.35 + p * 0.45),
    acousticness:     Math.max(0.05, 0.50 - p * 0.30),
    instrumentalness: 0.06,
  };
};

export const computeAudioStatsFromTracks = (
  tracks: SpotifyTrack[],
  artists: SpotifyArtist[],
  audioFeatures?: AudioFeatures[]
): AudioStats => {
  if (!tracks.length) {
    return {
      avgTempo: 100, avgEnergy: 0.5, avgValence: 0.5,
      avgDanceability: 0.5, avgAcousticness: 0.3, avgInstrumentalness: 0.1,
      tempoOverTime: [], moodGenreMatrix: [],
    };
  }

  const featuresById = new Map<string, AudioFeatures>();
  audioFeatures?.forEach((f) => featuresById.set(f.id, f));

  const artistById = new Map<string, SpotifyArtist>();
  artists.forEach((a) => artistById.set(a.id, a));

  const resolved = tracks.map((t, i) => {
    const af = featuresById.get(t.id);
    if (af) {
      return {
        energy: af.energy, valence: af.valence, tempo: af.tempo,
        danceability: af.danceability, acousticness: af.acousticness,
        instrumentalness: af.instrumentalness, fromApi: true,
      };
    }
    const trackArtists = t.artists.map((a) => artistById.get(a.id)).filter(Boolean) as SpotifyArtist[];
    return { ...estimateFromTrack(t, i, tracks.length, trackArtists), fromApi: false };
  });

  const avg = (fn: (e: typeof resolved[0]) => number) =>
    resolved.reduce((s, e) => s + fn(e), 0) / resolved.length;

  const realCount = resolved.filter((r) => r.fromApi).length;
  console.log(`[Analysis] Audio features: ${realCount}/${tracks.length} from Spotify API`);

  const stats: AudioStats = {
    avgTempo:            avg((e) => e.tempo),
    avgEnergy:           avg((e) => e.energy),
    avgValence:          avg((e) => e.valence),
    avgDanceability:     avg((e) => e.danceability),
    avgAcousticness:     avg((e) => e.acousticness),
    avgInstrumentalness: avg((e) => e.instrumentalness),
    tempoOverTime: tracks.map((t, i) => ({
      trackName: t.name,
      tempo:     Math.round(resolved[i].tempo),
      index:     i,
    })),
    moodGenreMatrix: tracks.map((t, i) => ({
      trackName: t.name,
      valence:   resolved[i].valence,
      energy:    resolved[i].energy,
      genre:     inferGenre(artists, t.artists.map((a) => a.id)),
      trackId:   t.id,
      tempo:     Math.round(resolved[i].tempo),
    })),
  };

  console.log("[Analysis] avgEnergy:", stats.avgEnergy.toFixed(2), "avgValence:", stats.avgValence.toFixed(2), "avgTempo:", stats.avgTempo.toFixed(0));
  return stats;
};

const ARCHETYPES: Array<{
  name: string;
  condition: (e: number, v: number, t: number, d: number, a: number) => boolean;
  description: string;
  studyParams: { targetEnergy: number; targetValence: number; targetTempo: number; minInstrumentalness: number };
}> = [
  {
    name: "The Warrior",
    condition: (e, v, t, d) => e > 0.82 && v < 0.38 && t > 138,
    description: "Müzik senin için bir silah. Adrenalin ve yoğunluk, en sert ritimlerle en karanlık atmosferlerde parlarsın. Rakipsiz bir odak gücün var.",
    studyParams: { targetEnergy: 0.42, targetValence: 0.30, targetTempo: 88, minInstrumentalness: 0.55 },
  },
  {
    name: "The Shadow Runner",
    condition: (e, v, t) => e > 0.64 && v < 0.38 && t > 125,
    description: "Karanlık tonlar, yüksek enerji, hızlı tempo. Gece şehrin koşucusu gibi dinliyorsun — ritmik, odaklı, acımasız.",
    studyParams: { targetEnergy: 0.38, targetValence: 0.28, targetTempo: 82, minInstrumentalness: 0.58 },
  },
  {
    name: "The Night Owl",
    condition: (e, v) => e > 0.64 && v < 0.40,
    description: "Yüksek enerji, karanlık atmosfer. Gece çalışmayı sever, yoğun konsantrasyon anlarında parlar. Dingin değil — derin.",
    studyParams: { targetEnergy: 0.40, targetValence: 0.32, targetTempo: 85, minInstrumentalness: 0.52 },
  },
  {
    name: "The Hype Beast",
    condition: (e, v, t, d) => e > 0.74 && v > 0.54 && t > 122,
    description: "Maksimum enerji, maksimum pozitiflik ve hız. Dans pistinin kalbi senin müziğinde atıyor. Sessizlik yoktur senin için.",
    studyParams: { targetEnergy: 0.52, targetValence: 0.62, targetTempo: 105, minInstrumentalness: 0.58 },
  },
  {
    name: "The Groove Master",
    condition: (e, v, t, d) => e > 0.62 && v > 0.52 && d > 0.64,
    description: "Ritim senin kalbini atlatır. Enerjik ama kontrollü, mutlu ama derin. Dans ve akış senin doğal durumun.",
    studyParams: { targetEnergy: 0.48, targetValence: 0.58, targetTempo: 98, minInstrumentalness: 0.58 },
  },
  {
    name: "The Optimist",
    condition: (e, v) => e > 0.58 && v > 0.52,
    description: "Enerjik ve pozitif. Hızlı tempolu müzik seni motive eder. Zorlu anlarda bile pozitif bir enerji yayarsın.",
    studyParams: { targetEnergy: 0.50, targetValence: 0.60, targetTempo: 100, minInstrumentalness: 0.60 },
  },
  {
    name: "The Soul Searcher",
    condition: (e, v, t, d, a) => e < 0.44 && v < 0.28,
    description: "Duygusal derinlik senin müziğinin özü. Melankolik tonları sever, müzikte anlam ve hikaye ararsın. Arabesk ruhunu taşırsın.",
    studyParams: { targetEnergy: 0.22, targetValence: 0.22, targetTempo: 72, minInstrumentalness: 0.62 },
  },
  {
    name: "The Connoisseur",
    condition: (e, v, t) => e < 0.52 && v > 0.50 && t < 108,
    description: "Sofistike ve dingin. Müzikte form ve nüans ararsın. Jazz, akustik ve düşünceli ses dünyalarında kaybolursun.",
    studyParams: { targetEnergy: 0.28, targetValence: 0.65, targetTempo: 80, minInstrumentalness: 0.72 },
  },
  {
    name: "The Deep Thinker",
    condition: (e, v) => e <= 0.58 && v < 0.48,
    description: "Sakin, introspektif ve melankolik tınılar. Derin analitik çalışmalar ve felsefi anlar için mükemmel bir müzik profili.",
    studyParams: { targetEnergy: 0.26, targetValence: 0.35, targetTempo: 72, minInstrumentalness: 0.70 },
  },
  {
    name: "The Flow State",
    condition: () => true,
    description: "Dengeli ve sürdürülebilir. Sakin ama mutlu bir müzik profilin var — her ortama uyum sağlar, uzun süreli odaklanmada zirveye çıkarsın.",
    studyParams: { targetEnergy: 0.32, targetValence: 0.65, targetTempo: 80, minInstrumentalness: 0.65 },
  },
];

export const buildCharacterProfile = (stats: AudioStats): CharacterProfile => {
  const archetype = ARCHETYPES.find((a) =>
    a.condition(stats.avgEnergy, stats.avgValence, stats.avgTempo, stats.avgDanceability, stats.avgAcousticness)
  ) ?? ARCHETYPES[ARCHETYPES.length - 1];
  return {
    archetype: archetype.name,
    description: archetype.description,
    stats,
    studyPlaylistParams: archetype.studyParams,
  };
};

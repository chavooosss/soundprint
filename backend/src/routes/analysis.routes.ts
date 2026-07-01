import { Router } from "express";
import axios from "axios";
import { config } from "../config";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getTopTracks, getTopArtists, getRecentlyPlayed, getAudioFeatures,
  createSpotifyPlaylist, addTracksToPlaylist, getRecommendations, getMe,
} from "../services/spotify.service";
import { computeAudioStatsFromTracks, buildCharacterProfile, estimateFromTrack } from "../services/analysis.service";

const router = Router();
router.use(requireAuth);

router.get("/profile", async (req, res) => {
  try {
    const token = req.session.spotifyTokens!.access_token;
    const timeRanges = ["short_term", "medium_term", "long_term"] as const;

    const [tracksResults, artistsResults, recentlyPlayed] = await Promise.all([
      Promise.all(timeRanges.map((tr) => getTopTracks(token, tr, 50))),
      Promise.all(timeRanges.map((tr) => getTopArtists(token, tr, 20))),
      getRecentlyPlayed(token, 50),
    ]);

    const [shortTracks, mediumTracks, longTracks] = tracksResults;
    const [shortArtists, mediumArtists, longArtists] = artistsResults;
    const allArtists = [...shortArtists, ...mediumArtists, ...longArtists];

    // Try audio features API (deprecated for new apps — falls back to genre-based estimation)
    const audioFeatures = await getAudioFeatures(token, mediumTracks.map((t) => t.id)).catch(() => []);

    // Compute per-period stats independently (different tracks per period)
    const shortStats  = computeAudioStatsFromTracks(shortTracks,  [...shortArtists,  ...mediumArtists, ...longArtists], audioFeatures);
    const mediumStats = computeAudioStatsFromTracks(mediumTracks, allArtists, audioFeatures);
    const longStats   = computeAudioStatsFromTracks(longTracks,   [...longArtists,   ...mediumArtists, ...shortArtists], audioFeatures);

    const profiles = {
      short_term:  buildCharacterProfile(shortStats),
      medium_term: buildCharacterProfile(mediumStats),
      long_term:   buildCharacterProfile(longStats),
    };

    res.json({
      topTracks:  { short_term: shortTracks,  medium_term: mediumTracks,  long_term: longTracks  },
      topArtists: { short_term: shortArtists, medium_term: mediumArtists, long_term: longArtists },
      recentlyPlayed,
      profile:  profiles.medium_term,
      profiles,
    });
  } catch (err) {
    console.error("[Analysis Profile]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.post("/create-playlist", async (req, res) => {
  try {
    const token = req.session.spotifyTokens!.access_token;

    // Always fetch fresh userId from Spotify to avoid session mismatch → 403
    const me = await getMe(token);
    const userId = me.id;
    req.session.userId = userId;

    const { name, description, trackUris } = req.body as {
      name: string; description?: string; trackUris: string[]; public?: boolean;
    };

    if (!name?.trim() || !Array.isArray(trackUris) || !trackUris.length) {
      res.status(400).json({ error: "name ve trackUris gerekli" });
      return;
    }
    console.log("[Create Playlist] userId:", userId, "display_name:", me.display_name, "tracks:", trackUris.length);

    // Try public first, fall back to private if 403 (scope issue)
    let playlist;
    try {
      playlist = await createSpotifyPlaylist(token, userId, name.trim(), description ?? "", true);
    } catch (pubErr: any) {
      if (pubErr?.response?.status === 403) {
        console.log("[Create Playlist] Public failed, trying private...");
        playlist = await createSpotifyPlaylist(token, userId, name.trim(), description ?? "", false);
      } else {
        throw pubErr;
      }
    }
    await addTracksToPlaylist(token, playlist.id, trackUris);

    res.json({ url: playlist.external_urls.spotify, id: playlist.id });
  } catch (err: any) {
    const spotifyStatus = err?.response?.status;
    const spotifyMsg = err?.response?.data?.error?.message ?? "";
    const spotifyReason = err?.response?.data?.error?.reason ?? "";
    const grantedScopes = req.session.spotifyTokens?.scope ?? "unknown";
    console.error("[Create Playlist] Spotify error", spotifyStatus, spotifyMsg, spotifyReason);
    console.error("[Create Playlist] Token scopes:", grantedScopes);
    console.error("[Create Playlist] Full response:", err?.response?.data);
    if (spotifyStatus === 403) {
      const hasPlaylistScope = grantedScopes.includes("playlist-modify");
      res.status(403).json({
        error: hasPlaylistScope
          ? "Spotify playlist oluşturma izni reddedildi (uygulama kısıtlaması olabilir)."
          : "Playlist izni yok. Spotify'dan çıkış yapıp tekrar giriş yapın.",
        code: "SCOPE_MISSING",
        detail: spotifyMsg,
        scopes: grantedScopes,
      });
    } else {
      res.status(500).json({ error: "Playlist oluşturulamadı", detail: spotifyMsg || err?.message });
    }
  }
});

router.post("/recommendations", async (req, res) => {
  const token = req.session.spotifyTokens!.access_token;
  const {
    seedArtistIds, seedTrackIds,
    minEnergy, maxEnergy,
    minValence, maxValence,
    minTempo, maxTempo,
    targetEnergy, targetValence, targetTempo,
    limit = 20,
  } = req.body as {
    seedArtistIds?: string[];
    seedTrackIds?:  string[];
    minEnergy?:  number; maxEnergy?:  number;
    minValence?: number; maxValence?: number;
    minTempo?:   number; maxTempo?:   number;
    targetEnergy?:  number;
    targetValence?: number;
    targetTempo?:   number;
    limit?: number;
  };

  // Try Spotify Recommendations API
  try {
    const tracks = await getRecommendations(token, {
      seed_artists:   seedArtistIds,
      seed_tracks:    seedTrackIds,
      min_energy:     minEnergy,     max_energy:  maxEnergy,
      min_valence:    minValence,    max_valence: maxValence,
      min_tempo:      minTempo,      max_tempo:   maxTempo,
      target_energy:  targetEnergy,
      target_valence: targetValence,
      target_tempo:   targetTempo,
      limit,
    });
    if (tracks?.length) { res.json({ tracks }); return; }
  } catch {
    // Spotify Recommendations API is deprecated for new apps — use fallback
  }

  // Fallback: filter user's own top tracks by mood parameters
  try {
    const [artists, short, medium, long] = await Promise.all([
      getTopArtists(token, "medium_term", 20),
      getTopTracks(token, "short_term", 50),
      getTopTracks(token, "medium_term", 50),
      getTopTracks(token, "long_term", 50),
    ]);

    const trackMap = new Map<string, typeof short[0]>();
    [...short, ...medium, ...long].forEach((t) => trackMap.set(t.id, t));
    const allTracks = Array.from(trackMap.values());

    const artistById = new Map(artists.map((a) => [a.id, a]));

    // Score every track: lower = better match for the mood
    const distToRange = (v: number, mn?: number, mx?: number) => {
      if (mn != null && v < mn) return mn - v;
      if (mx != null && v > mx) return v - mx;
      return 0;
    };

    const withEstimates = allTracks.map((t, i) => {
      const ta = t.artists.map((a) => artistById.get(a.id)).filter(Boolean) as typeof artists;
      const est = estimateFromTrack(t, i, allTracks.length, ta);

      // Range penalty: how far outside the mood's energy/valence/tempo window
      const rangePenalty =
        distToRange(est.energy,  minEnergy,  maxEnergy)  * 4 +
        distToRange(est.valence, minValence, maxValence) * 3 +
        distToRange(est.tempo,   minTempo,   maxTempo)   * 0.008;

      // Target affinity: distance from the ideal target values
      const targetDist =
        (targetEnergy  != null ? Math.abs(est.energy  - targetEnergy)  * 1.5 : 0) +
        (targetValence != null ? Math.abs(est.valence - targetValence) * 1.2 : 0) +
        (targetTempo   != null ? Math.abs(est.tempo   - targetTempo)   * 0.004 : 0);

      return { track: t, est, score: rangePenalty * 10 + targetDist };
    });

    // Sort best-match first; add small jitter so result varies each call
    withEstimates.sort((a, b) => (a.score - b.score) + (Math.random() - 0.5) * 0.15);

    // Artist diversity: max 2 tracks per artist to avoid "all from same artist" playlists
    const artistCount = new Map<string, number>();
    const diverse: typeof withEstimates = [];
    for (const item of withEstimates) {
      const artistId = item.track.artists?.[0]?.id ?? "unknown";
      const count = artistCount.get(artistId) ?? 0;
      if (count < 2) {
        diverse.push(item);
        artistCount.set(artistId, count + 1);
      }
      if (diverse.length >= Math.min(limit, 100)) break;
    }
    // Fill remaining spots if diversity filter left us short
    if (diverse.length < Math.min(limit, 100)) {
      for (const item of withEstimates) {
        if (!diverse.includes(item)) diverse.push(item);
        if (diverse.length >= Math.min(limit, 100)) break;
      }
    }

    res.json({ tracks: diverse.map(({ track }) => track), fallback: true });
  } catch (err: any) {
    console.error("[Recommendations fallback]", err?.message ?? err);
    res.status(500).json({ error: "Öneriler alınamadı" });
  }
});

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

router.post("/ai-personality", async (req, res) => {
  if (!config.geminiApiKey) {
    res.status(503).json({ error: "Gemini API key not configured on server." });
    return;
  }

  const { archetype, avgEnergy, avgValence, avgTempo, topTracks, topArtists } = req.body as {
    archetype: string;
    avgEnergy: number;
    avgValence: number;
    avgTempo: number;
    topTracks: Array<{ name: string; artistName: string }>;
    topArtists: Array<{ name: string }>;
  };

  const prompt = `Sen bir müzik psikologusun. Aşağıdaki Spotify verilerine göre kullanıcının müzik kişiliğini analiz et. Türkçe yaz.

Karakter: ${archetype}
Enerji: ${(avgEnergy * 100).toFixed(0)}%
Ruh Hali: ${(avgValence * 100).toFixed(0)}%
Tempo: ${Math.round(avgTempo)} BPM
Top Sanatçılar: ${topArtists.slice(0, 5).map((a) => a.name).join(", ")}
Top Parçalar: ${topTracks.slice(0, 5).map((t) => `${t.name} - ${t.artistName}`).join(", ")}

3 bölüm yaz, her biri ### başlık ile:
### Müzik Kişiliği
### Ruh Dünyası
### Hayat Tarzı İpuçları`;

  for (const model of GEMINI_MODELS) {
    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 800 } },
        { headers: { "Content-Type": "application/json" } }
      );
      const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        res.json({ result: text });
        return;
      }
    } catch {
      continue;
    }
  }

  res.status(502).json({ error: "Tüm Gemini modelleri başarısız oldu. Birkaç dakika bekleyip tekrar deneyin." });
});

export default router;

import { Router } from "express";
import axios from "axios";
import { config } from "../config";
import { requireAuth } from "../middleware/auth.middleware";
import { getTopTracks, getTopArtists, getRecentlyPlayed, getAudioFeatures, createSpotifyPlaylist, addTracksToPlaylist } from "../services/spotify.service";
import { computeAudioStatsFromTracks, buildCharacterProfile } from "../services/analysis.service";

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

    const audioFeatures = await getAudioFeatures(token, mediumTracks.map((t) => t.id));
    const stats = computeAudioStatsFromTracks(mediumTracks, allArtists, audioFeatures);
    const profile = buildCharacterProfile(stats);

    res.json({
      topTracks: { short_term: shortTracks, medium_term: mediumTracks, long_term: longTracks },
      topArtists: { short_term: shortArtists, medium_term: mediumArtists, long_term: longArtists },
      recentlyPlayed,
      profile,
    });
  } catch (err) {
    console.error("[Analysis Profile]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.post("/create-playlist", async (req, res) => {
  try {
    const token = req.session.spotifyTokens!.access_token;
    const userId = req.session.userId;
    if (!userId) { res.status(401).json({ error: "User ID not found in session" }); return; }

    const { name, description, trackUris, public: isPublic = false } = req.body as {
      name: string; description?: string; trackUris: string[]; public?: boolean;
    };

    if (!name?.trim() || !Array.isArray(trackUris) || !trackUris.length) {
      res.status(400).json({ error: "name ve trackUris gerekli" });
      return;
    }

    const playlist = await createSpotifyPlaylist(token, userId, name.trim(), description ?? "", isPublic);
    await addTracksToPlaylist(token, playlist.id, trackUris);

    res.json({ url: playlist.external_urls.spotify, id: playlist.id });
  } catch (err) {
    console.error("[Create Playlist]", err);
    res.status(500).json({ error: "Playlist oluşturulamadı" });
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

import { useState } from "react";
import axios from "axios";
import type { CharacterProfile } from "../types";

interface Props { tracks: any[]; artists: any[]; profile: CharacterProfile; }

const MOODS = [
  { id: "focus",      label: "Odaklanma",     desc: "Çalışma & konsantrasyon",  emoji: "🧠", minEnergy: 0.2, maxEnergy: 0.55, minValence: 0.2, maxValence: 0.65, minTempo: 65,  maxTempo: 100, targetEnergy: 0.35, targetValence: 0.45, targetTempo: 82  },
  { id: "energy",     label: "Enerji",        desc: "Antrenman & motivasyon",   emoji: "⚡", minEnergy: 0.6, maxEnergy: 1.0,  minValence: 0.3, maxValence: 0.9,  minTempo: 110, maxTempo: 180, targetEnergy: 0.80, targetValence: 0.55, targetTempo: 135 },
  { id: "relax",      label: "Rahatlama",     desc: "Akşam & dinlenme",         emoji: "🌙", minEnergy: 0.1, maxEnergy: 0.45, minValence: 0.2, maxValence: 0.7,  minTempo: 55,  maxTempo: 95,  targetEnergy: 0.28, targetValence: 0.50, targetTempo: 75  },
  { id: "happy",      label: "İyi Hissettir", desc: "Mutlu & pozitif",          emoji: "☀️", minEnergy: 0.5, maxEnergy: 0.85, minValence: 0.6, maxValence: 1.0,  minTempo: 95,  maxTempo: 140, targetEnergy: 0.65, targetValence: 0.78, targetTempo: 118 },
  { id: "melancholy", label: "Melankolik",    desc: "Derin & duygusal",         emoji: "🌧",  minEnergy: 0.1, maxEnergy: 0.5,  minValence: 0.0, maxValence: 0.38, minTempo: 55,  maxTempo: 100, targetEnergy: 0.32, targetValence: 0.20, targetTempo: 78  },
  { id: "party",      label: "Parti",         desc: "Dans & eğlence",           emoji: "🎉", minEnergy: 0.7, maxEnergy: 1.0,  minValence: 0.6, maxValence: 1.0,  minTempo: 115, maxTempo: 160, targetEnergy: 0.85, targetValence: 0.75, targetTempo: 128 },
];

const GENRE_PROFILES: Array<{ kw: string[]; e: number; v: number; t: number; d: number; a: number }> = [
  { kw: ["arabesk"],                                   e: 0.35, v: 0.15, t: 82,  d: 0.35, a: 0.55 },
  { kw: ["türkçe hip hop", "turkish hip hop"],         e: 0.72, v: 0.32, t: 93,  d: 0.70, a: 0.08 },
  { kw: ["trap türkçe", "turkish trap"],               e: 0.68, v: 0.28, t: 138, d: 0.65, a: 0.06 },
  { kw: ["trap"],                                      e: 0.70, v: 0.30, t: 140, d: 0.67, a: 0.06 },
  { kw: ["türkçe pop", "turkish pop"],                 e: 0.58, v: 0.60, t: 112, d: 0.62, a: 0.25 },
  { kw: ["türk sanat", "turkish classical"],           e: 0.25, v: 0.42, t: 85,  d: 0.28, a: 0.75 },
  { kw: ["türkçe alternatif", "turkish alternative"],  e: 0.55, v: 0.42, t: 105, d: 0.50, a: 0.35 },
  { kw: ["türkçe rock", "turkish rock"],               e: 0.75, v: 0.42, t: 128, d: 0.48, a: 0.15 },
  { kw: ["hip hop", "rap"],                            e: 0.65, v: 0.38, t: 92,  d: 0.68, a: 0.10 },
  { kw: ["r&b", "soul"],                               e: 0.50, v: 0.55, t: 92,  d: 0.62, a: 0.30 },
  { kw: ["pop"],                                       e: 0.62, v: 0.65, t: 118, d: 0.65, a: 0.20 },
  { kw: ["rock"],                                      e: 0.78, v: 0.48, t: 128, d: 0.52, a: 0.15 },
  { kw: ["metal"],                                     e: 0.92, v: 0.25, t: 155, d: 0.35, a: 0.05 },
  { kw: ["jazz"],                                      e: 0.38, v: 0.58, t: 105, d: 0.55, a: 0.65 },
  { kw: ["classical"],                                 e: 0.28, v: 0.50, t: 95,  d: 0.30, a: 0.80 },
  { kw: ["electronic", "edm", "house", "techno"],      e: 0.82, v: 0.62, t: 128, d: 0.78, a: 0.05 },
  { kw: ["reggae"],                                    e: 0.48, v: 0.68, t: 88,  d: 0.72, a: 0.35 },
  { kw: ["latin"],                                     e: 0.72, v: 0.75, t: 115, d: 0.80, a: 0.20 },
  { kw: ["folk", "acoustic"],                          e: 0.35, v: 0.55, t: 100, d: 0.45, a: 0.75 },
  { kw: ["blues"],                                     e: 0.42, v: 0.38, t: 90,  d: 0.48, a: 0.55 },
  { kw: ["country"],                                   e: 0.55, v: 0.62, t: 112, d: 0.55, a: 0.45 },
];

const estimateTrack = (track: any, index: number, total: number, artistById: Map<string, any>) => {
  const genres: string[] = track.artists?.flatMap((a: any) => artistById.get(a.id)?.genres ?? []) ?? [];
  const lower = genres.map((g: string) => g.toLowerCase());

  const matches = GENRE_PROFILES.filter(p => p.kw.some(kw => lower.some(g => g.includes(kw))));

  if (matches.length) {
    const avg = (fn: (p: typeof matches[0]) => number) => matches.reduce((s, p) => s + fn(p), 0) / matches.length;
    const seed = (track.id.charCodeAt(0) + track.id.charCodeAt(1)) / 200 - 0.5;
    return {
      energy:       Math.max(0.05, Math.min(0.98, avg(p => p.e) + seed * 0.08)),
      valence:      Math.max(0.05, Math.min(0.95, avg(p => p.v) + seed * 0.10)),
      tempo:        Math.max(60,   Math.min(200,  avg(p => p.t) + seed * 12)),
      danceability: Math.max(0.05, Math.min(0.95, avg(p => p.d) + seed * 0.08)),
    };
  }

  const pop = typeof track.popularity === "number" && track.popularity > 0 ? track.popularity : 50 + (track.id.charCodeAt(0) % 20);
  const p = Math.max(0.2, Math.min(1, pop / 100));
  const rankBoost = ((total - index) / total) * 0.10;
  return {
    energy:       Math.min(1, 0.40 + p * 0.40 + rankBoost),
    valence:      Math.min(1, 0.30 + p * 0.45),
    tempo:        80 + p * 55,
    danceability: Math.min(1, 0.35 + p * 0.45),
  };
};

const distToRange = (v: number, mn?: number, mx?: number) => {
  if (mn != null && v < mn) return mn - v;
  if (mx != null && v > mx) return v - mx;
  return 0;
};

const buildPlaylist = (tracks: any[], artists: any[], mood: typeof MOODS[0], limit: number): any[] => {
  const artistById = new Map(artists.map((a: any) => [a.id, a]));

  const scored = tracks.map((track, i) => {
    const est = estimateTrack(track, i, tracks.length, artistById);
    const rangePenalty =
      distToRange(est.energy,  mood.minEnergy,  mood.maxEnergy)  * 5 +
      distToRange(est.valence, mood.minValence, mood.maxValence) * 4 +
      distToRange(est.tempo,   mood.minTempo,   mood.maxTempo)   * 0.01;
    const targetDist =
      Math.abs(est.energy  - mood.targetEnergy)  * 1.5 +
      Math.abs(est.valence - mood.targetValence) * 1.2 +
      Math.abs(est.tempo   - mood.targetTempo)   * 0.005;
    return { track, score: rangePenalty * 10 + targetDist + (Math.random() - 0.5) * 0.15 };
  });

  scored.sort((a, b) => a.score - b.score);

  // Max 2 tracks per artist for variety
  const artistCount = new Map<string, number>();
  const result: any[] = [];
  for (const { track } of scored) {
    const aid = track.artists?.[0]?.id ?? "x";
    if ((artistCount.get(aid) ?? 0) < 2) {
      result.push(track);
      artistCount.set(aid, (artistCount.get(aid) ?? 0) + 1);
    }
    if (result.length >= limit) break;
  }
  // Fill if not enough variety
  if (result.length < limit) {
    for (const { track } of scored) {
      if (!result.includes(track)) result.push(track);
      if (result.length >= limit) break;
    }
  }
  return result;
};

export const PlaylistEngine = ({ tracks, artists, profile }: Props) => {
  const [mood, setMood] = useState(MOODS[0]);
  const [length, setLength] = useState(20);
  const [generated, setGenerated] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyWithFeedback = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const generate = () => {
    setSavedUrl(null);
    setSaveError(null);
    const result = buildPlaylist(tracks, artists, mood, length);
    setGenerated(result);
  };

  const saveToSpotify = async () => {
    if (!generated.length) return;
    setSaving(true);
    setSaveError(null);
    setSavedUrl(null);
    try {
      const trackUris = generated.map((t: any) => t.uri).filter(Boolean);
      if (!trackUris.length) { setSaveError("Parça URI'si bulunamadı."); setSaving(false); return; }

      const { data: auth } = await axios.get("/auth/token", { withCredentials: true });
      const { access_token, userId } = auth as { access_token: string; userId: string };
      const SPOTIFY = "https://api.spotify.com/v1";
      const headers = { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };

      const { data: pl } = await axios.post(
        `${SPOTIFY}/users/${userId}/playlists`,
        { name: `${mood.emoji} ${mood.label} — Soundprint`, description: `${mood.label} playlistim. Soundprint tarafından oluşturuldu.`, public: false },
        { headers }
      );
      for (let i = 0; i < trackUris.length; i += 100) {
        await axios.post(`${SPOTIFY}/playlists/${pl.id}/tracks`, { uris: trackUris.slice(i, i + 100) }, { headers });
      }
      setSavedUrl(pl.external_urls.spotify);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error?.message ?? err?.message ?? "Bilinmeyen hata";
      console.error("[Playlist save]", status, err?.response?.data);
      if (status === 403) {
        setSaveError("Spotify API şu an playlist oluşturmaya izin vermiyor (uygulama kısıtlaması). Aşağıdaki butonlarla şarkıları kopyalayabilirsin.");
      } else if (!status) {
        setSaveError("Ağ bağlantısı hatası. İnternet bağlantını kontrol et.");
      } else {
        setSaveError(`Kaydedilemedi (${status}): ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const totalMin = Math.floor(generated.reduce((s, t) => s + (t.duration_ms ?? 0), 0) / 60000);
  void profile;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 4 }}>Playlist Motoru</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>Dinleme geçmişinden ruh haline göre anlık oluşturma</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
          {MOODS.map((m) => (
            <div key={m.id} onClick={() => { setMood(m); setGenerated([]); setSavedUrl(null); setSaveError(null); }}
              style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${mood.id === m.id ? "var(--accent)" : "var(--border)"}`, background: mood.id === m.id ? "rgba(0,113,227,0.05)" : "var(--bg2)", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{m.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: mood.id === m.id ? "var(--accent)" : "var(--text)" }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8 }}>Parça sayısı: {length}</div>
            <input type="range" min="5" max="50" value={length} onChange={(e) => setLength(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
          </div>
          <button onClick={generate}
            style={{ padding: "10px 24px", borderRadius: 980, background: "var(--accent)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.2s" }}>
            Oluştur →
          </button>
        </div>

        <div style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 12, color: "var(--text2)" }}>
          <strong style={{ color: "var(--accent)" }}>{mood.emoji} {mood.label}</strong>
          {" "}· Enerji {(mood.minEnergy*100).toFixed(0)}–{(mood.maxEnergy*100).toFixed(0)}%
          {" "}· Tempo {mood.minTempo}–{mood.maxTempo} BPM
          <span style={{ color: "var(--text3)", marginLeft: 8 }}>· {tracks.length} parçandan seçiliyor</span>
        </div>
      </div>

      {generated.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{mood.emoji} {mood.label} Playlist</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 1 }}>{generated.length} parça · ~{totalMin} dakika</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      {savedUrl ? (
                <a href={savedUrl} target="_blank" rel="noreferrer"
                  style={{ padding: "8px 18px", borderRadius: 980, background: "#1DB954", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  ✓ Spotify'da Aç
                </a>
              ) : (
                <button onClick={saveToSpotify} disabled={saving}
                  style={{ padding: "8px 18px", borderRadius: 980, background: saving ? "var(--bg)" : "#1DB954", border: "none", color: saving ? "var(--text3)" : "#fff", fontSize: 12, fontWeight: 600, cursor: saving ? "default" : "pointer", transition: "all 0.2s" }}>
                  {saving ? "Kaydediliyor..." : "♫ Spotify'a Kaydet"}
                </button>
              )}
            </div>
          </div>
          <div style={{ maxHeight: 400, overflow: "auto" }}>
            {generated.map((t: any, i: number) => (
              <div key={t.id ?? i} className="track-item" style={{ borderBottom: i < generated.length - 1 ? "1px solid var(--border2)" : "none", borderRadius: 0, padding: "10px 20px" }}>
                <span style={{ fontSize: 11, color: "var(--text3)", width: 22, textAlign: "right", flexShrink: 0 }}>{i+1}</span>
                <img src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} alt="" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.artists?.map((a: any) => a.name).join(", ")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>
                    {t.duration_ms ? `${Math.floor(t.duration_ms/60000)}:${String(Math.floor((t.duration_ms%60000)/1000)).padStart(2,"0")}` : ""}
                  </span>
                  {t.external_urls?.spotify && (
                    <a href={t.external_urls.spotify} target="_blank" rel="noreferrer"
                      style={{ fontSize: 10, color: "#1DB954", fontWeight: 700, textDecoration: "none", background: "rgba(29,185,84,0.1)", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>
                      ▶
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Export row */}
          {!savedUrl && (
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  const text = generated.map((t: any, i: number) =>
                    `${i+1}. ${t.name} — ${t.artists?.map((a: any) => a.name).join(", ")}`
                  ).join("\n");
                  copyWithFeedback(text, "isim");
                }}
                style={{ fontSize: 11, fontWeight: 600, color: copied === "isim" ? "#fff" : "var(--text2)", background: copied === "isim" ? "var(--accent)" : "var(--bg)", border: `1px solid ${copied === "isim" ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                {copied === "isim" ? "✓ Kopyalandı!" : "📋 İsimleri Kopyala"}
              </button>
              <button
                onClick={() => {
                  const uris = generated.map((t: any) => t.uri).filter(Boolean).join(",");
                  copyWithFeedback(uris, "uri");
                }}
                style={{ fontSize: 11, fontWeight: 600, color: copied === "uri" ? "#fff" : "var(--text2)", background: copied === "uri" ? "var(--accent)" : "var(--bg)", border: `1px solid ${copied === "uri" ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }}>
                {copied === "uri" ? "✓ Kopyalandı!" : "🔗 URI'leri Kopyala"}
              </button>
              <span style={{ fontSize: 10, color: "var(--text3)", alignSelf: "center", flex: 1 }}>
                Spotify Desktop'ta URI'yi arama çubuğuna yapıştır
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

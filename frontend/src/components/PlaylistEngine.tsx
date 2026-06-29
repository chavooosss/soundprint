import { useState } from "react";
import type { CharacterProfile } from "../types";
import { analysisService } from "../services/api";

interface Props { tracks: any[]; artists: any[]; profile: CharacterProfile; }

const MOODS = [
  { id: "focus",      label: "Odaklanma",     desc: "Çalışma & konsantrasyon",  emoji: "🧠", energy: [0.3,0.5], valence: [0.3,0.6], bpm: [70,95]   },
  { id: "energy",     label: "Enerji",        desc: "Antrenman & motivasyon",   emoji: "⚡", energy: [0.7,1.0], valence: [0.5,0.9], bpm: [120,160] },
  { id: "relax",      label: "Rahatlama",     desc: "Akşam & dinlenme",         emoji: "🌙", energy: [0.1,0.4], valence: [0.3,0.7], bpm: [60,90]   },
  { id: "happy",      label: "İyi Hissettir", desc: "Mutlu & pozitif",          emoji: "☀️", energy: [0.5,0.8], valence: [0.6,1.0], bpm: [100,130] },
  { id: "melancholy", label: "Melankolik",    desc: "Derin & duygusal",         emoji: "🌧", energy: [0.2,0.5], valence: [0.1,0.4], bpm: [60,100]  },
  { id: "party",      label: "Parti",         desc: "Dans & eğlence",           emoji: "🎉", energy: [0.7,1.0], valence: [0.6,1.0], bpm: [120,150] },
];

export const PlaylistEngine = ({ tracks, profile }: Props) => {
  const [mood, setMood] = useState(MOODS[0]);
  const [length, setLength] = useState(20);
  const [generated, setGenerated] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Build lookup map from real audio features (moodGenreMatrix has tempo+energy+valence per trackId)
  const realFeaturesMap = new Map(
    profile.stats.moodGenreMatrix.map((m) => [m.trackId, m])
  );

  const generate = () => {
    setSavedUrl(null);
    setSaveError(null);

    const scored = tracks.map((t: any, i: number) => {
      const real = realFeaturesMap.get(t.id);
      let energy: number, valence: number, tempo: number;

      if (real) {
        energy  = real.energy;
        valence = real.valence;
        tempo   = real.tempo;
      } else {
        const p = Math.max(0.3, (t.popularity ?? 60) / 100);
        energy  = 0.35 + p * 0.45 + (tracks.length - i) / tracks.length * 0.15;
        valence = 0.25 + p * 0.5;
        tempo   = 75 + p * 65;
      }

      const score =
        (energy  >= mood.energy[0]  && energy  <= mood.energy[1]  ? 1 : 0) +
        (valence >= mood.valence[0] && valence <= mood.valence[1] ? 1 : 0) +
        (tempo   >= mood.bpm[0]     && tempo   <= mood.bpm[1]     ? 1 : 0);

      return { track: t, score };
    });

    setGenerated(
      scored.sort((a, b) => b.score - a.score || Math.random() - 0.5)
        .slice(0, length)
        .map((s) => s.track)
    );
  };

  const saveToSpotify = async () => {
    if (!generated.length) return;
    setSaving(true);
    setSaveError(null);
    setSavedUrl(null);
    try {
      const trackUris = generated.map((t: any) => t.uri).filter(Boolean);
      const { data } = await analysisService.createPlaylist({
        name: `${mood.emoji} ${mood.label} — Soundprint`,
        description: `${mood.label} playlistim. Soundprint tarafından oluşturuldu.`,
        trackUris,
        public: false,
      });
      setSavedUrl(data.url);
    } catch {
      setSaveError("Playlist kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  };

  const totalDuration = generated.reduce((s, t) => s + (t.duration_ms ?? 0), 0);
  const totalMin = Math.floor(totalDuration / 60000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mood selector */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 4 }}>Playlist Öneri Motoru</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>Ruh haline göre top listenden kişisel playlist oluştur</div>
        <div className="mood-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
          {MOODS.map((m) => (
            <div key={m.id} onClick={() => setMood(m)}
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
          <button onClick={generate} style={{ padding: "10px 24px", borderRadius: 980, background: "var(--accent)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; }}>
            Oluştur →
          </button>
        </div>

        <div style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 12, color: "var(--text2)" }}>
          <strong style={{ color: mood.energy[0] > 0.6 ? "var(--green)" : mood.energy[1] < 0.4 ? "var(--purple)" : "var(--accent)" }}>{mood.emoji} {mood.label}</strong>
          {" "}· Enerji {(mood.energy[0]*100).toFixed(0)}-{(mood.energy[1]*100).toFixed(0)}% · Tempo {mood.bpm[0]}-{mood.bpm[1]} BPM
          {realFeaturesMap.size > 0 && <span style={{ color: "var(--green)", marginLeft: 8 }}>· {realFeaturesMap.size} gerçek veri</span>}
        </div>
      </div>

      {/* Results */}
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
                  style={{ padding: "8px 18px", borderRadius: 980, background: "#1DB954", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  ✓ Spotify'da Aç
                </a>
              ) : (
                <button onClick={saveToSpotify} disabled={saving}
                  style={{ padding: "8px 18px", borderRadius: 980, background: saving ? "var(--bg)" : "#1DB954", border: "none", color: saving ? "var(--text3)" : "#fff", fontSize: 12, fontWeight: 600, cursor: saving ? "default" : "pointer", transition: "all 0.2s" }}>
                  {saving ? "Kaydediliyor..." : "♫ Spotify'a Kaydet"}
                </button>
              )}
              {saveError && <div style={{ fontSize: 11, color: "var(--red)" }}>{saveError}</div>}
            </div>
          </div>
          <div style={{ maxHeight: 400, overflow: "auto" }}>
            {generated.map((t: any, i: number) => (
              <div key={t.id} className="track-item" style={{ borderBottom: i < generated.length - 1 ? "1px solid var(--border2)" : "none", borderRadius: 0, padding: "10px 20px" }}>
                <span style={{ fontSize: 11, color: "var(--text3)", width: 22, textAlign: "right", flexShrink: 0 }}>{i+1}</span>
                <img src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.artists?.map((a:any)=>a.name).join(", ")}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>
                  {t.duration_ms ? `${Math.floor(t.duration_ms/60000)}:${String(Math.floor((t.duration_ms%60000)/1000)).padStart(2,"0")}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

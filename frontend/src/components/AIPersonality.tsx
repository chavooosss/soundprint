import { useState } from "react";
import type { CharacterProfile } from "../types";

interface Props { profile: CharacterProfile; topTracks: any[]; topArtists: any[]; }

type Section = { heading: string; body: string };

const parseMarkdown = (raw: string): Section[] => {
  const sections: Section[] = [];
  const blocks = raw.split(/^### /m).filter(Boolean);
  for (const block of blocks) {
    const newline = block.indexOf("\n");
    const heading = newline > 0 ? block.slice(0, newline).trim() : block.trim();
    const body = newline > 0 ? block.slice(newline + 1).trim() : "";
    if (heading) sections.push({ heading, body });
  }
  return sections.length ? sections : [{ heading: "", body: raw.trim() }];
};

const renderBody = (text: string) =>
  text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_m, g) => `<b>${g}</b>`);
    return (
      <p key={i} style={{ marginBottom: 6, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: bold.replace(/<(?!b>|\/b>)[^>]*>/g, "") }} />
    );
  });

export const AIPersonality = ({ profile, topTracks, topArtists }: Props) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true); setSections([]); setDone(false); setError("");
    try {
      const res = await fetch("/api/analysis/ai-personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          archetype: profile.archetype,
          avgEnergy: profile.stats.avgEnergy,
          avgValence: profile.stats.avgValence,
          avgTempo: profile.stats.avgTempo,
          topTracks: topTracks.slice(0, 5).map((t: any) => ({
            name: t.name,
            artistName: t.artists?.[0]?.name ?? "",
          })),
          topArtists: topArtists.slice(0, 5).map((a: any) => ({ name: a.name })),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Analiz başarısız.");
      } else {
        setSections(parseMarkdown(data.result));
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    }
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#af52de,#5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>AI Kişilik Analizi</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Gemini ile müzik psikolojisi</div>
        </div>
        {!done && !loading && (
          <button onClick={analyze}
            style={{ padding: "9px 18px", borderRadius: 980, background: "var(--accent)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Analiz Et →
          </button>
        )}
        {done && (
          <button onClick={() => { setDone(false); setSections([]); setError(""); }}
            style={{ padding: "9px 18px", borderRadius: 980, background: "transparent", border: "1px solid var(--border)", color: "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Yenile
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text2)", fontSize: 13, padding: "20px 0" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,113,227,0.2)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          Analiz ediliyor...
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: 10, fontSize: 13, color: "var(--red)", lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {sections.length > 0 && (
        <div style={{ fontSize: 14, color: "var(--text)" }}>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              {s.heading && (
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  {s.heading}
                </div>
              )}
              {renderBody(s.body)}
            </div>
          ))}
        </div>
      )}

      {!sections.length && !loading && !error && (
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
          Yapay zeka müzik profiline göre kişilik yorumu yapacak
        </div>
      )}
    </div>
  );
};

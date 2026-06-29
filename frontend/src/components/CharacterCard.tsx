import type { CharacterProfile } from "../types";
interface Props { profile: CharacterProfile; }

const META: Record<string, { emoji: string; color: string; bg: string }> = {
  "The Night Owl":    { emoji: "🦉", color: "#0071e3", bg: "rgba(0,113,227,0.08)" },
  "The Optimist":     { emoji: "☀️", color: "#ff9f0a", bg: "rgba(255,159,10,0.08)" },
  "The Deep Thinker": { emoji: "🧠", color: "#af52de", bg: "rgba(175,82,222,0.08)" },
  "The Flow State":   { emoji: "🌊", color: "#34c759", bg: "rgba(52,199,89,0.08)" },
  "The Versatile":    { emoji: "✦",  color: "#ff2d55", bg: "rgba(255,45,85,0.08)" },
};

export const CharacterCard = ({ profile }: Props) => {
  const { stats } = profile;
  const m = META[profile.archetype] ?? META["The Versatile"];
  const bars = [
    { label: "Enerji",            val: stats.avgEnergy,          color: "#0071e3" },
    { label: "Pozitiflik",        val: stats.avgValence,         color: "#34c759" },
    { label: "Dansedilebilirlik", val: stats.avgDanceability,    color: "#af52de" },
    { label: "Akustiklik",        val: stats.avgAcousticness,    color: "#ff9f0a" },
  ];
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "12px 14px", background: m.bg, borderRadius: 12 }}>
        <span style={{ fontSize: 28 }}>{m.emoji}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: m.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Müzik Karakterin</div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" }}>{profile.archetype}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.75, marginBottom: 16 }}>{profile.description}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bars.map(b => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 500, marginBottom: 5 }}>
              <span style={{ color: "var(--text2)" }}>{b.label}</span>
              <span style={{ color: b.color }}>{(b.val * 100).toFixed(0)}%</span>
            </div>
            <div style={{ height: 4, background: "var(--bg)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${b.val * 100}%`, background: b.color, borderRadius: 2, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          </div>
        ))}
        <div style={{ paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text2)", fontWeight: 500 }}>Ortalama Tempo</span>
          <span style={{ color: m.color, fontWeight: 700 }}>{Math.round(stats.avgTempo)} BPM</span>
        </div>
      </div>
    </div>
  );
};

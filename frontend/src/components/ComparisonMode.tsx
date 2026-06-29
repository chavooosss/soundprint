import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { CharacterProfile } from "../types";

interface PeriodData { label: string; tracks: any[]; artists: any[]; profile: CharacterProfile; }
interface Props { short: PeriodData; medium: PeriodData; long: PeriodData; }

const COLORS = { short: "#0071e3", medium: "#34c759", long: "#af52de" };

export const ComparisonMode = ({ short, medium, long }: Props) => {
  const periods = [
    { key: "short" as const, data: short, label: "4 Hafta" },
    { key: "medium" as const, data: medium, label: "6 Ay" },
    { key: "long" as const, data: long, label: "Tüm Zaman" },
  ];

  const radarData = [
    { subject: "Enerji",    short: short.profile.stats.avgEnergy * 100, medium: medium.profile.stats.avgEnergy * 100, long: long.profile.stats.avgEnergy * 100 },
    { subject: "Ruh Hali", short: short.profile.stats.avgValence * 100, medium: medium.profile.stats.avgValence * 100, long: long.profile.stats.avgValence * 100 },
    { subject: "Dans",     short: short.profile.stats.avgDanceability * 100, medium: medium.profile.stats.avgDanceability * 100, long: long.profile.stats.avgDanceability * 100 },
    { subject: "Akustik",  short: short.profile.stats.avgAcousticness * 100, medium: medium.profile.stats.avgAcousticness * 100, long: long.profile.stats.avgAcousticness * 100 },
    { subject: "Tempo",    short: (short.profile.stats.avgTempo / 200) * 100, medium: (medium.profile.stats.avgTempo / 200) * 100, long: (long.profile.stats.avgTempo / 200) * 100 },
  ];

  const metrics = [
    { label: "Enerji", key: "avgEnergy" as const, fmt: (v: number) => (v * 100).toFixed(0) + "%" },
    { label: "Ruh Hali", key: "avgValence" as const, fmt: (v: number) => (v * 100).toFixed(0) + "%" },
    { label: "Ort. Tempo", key: "avgTempo" as const, fmt: (v: number) => Math.round(v) + " BPM" },
    { label: "Dansedilebilirlik", key: "avgDanceability" as const, fmt: (v: number) => (v * 100).toFixed(0) + "%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {periods.map(p => (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[p.key] }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Radar */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Dönem Karşılaştırması</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>3 dönem arasında ses profili değişimi</div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="rgba(0,0,0,0.06)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: "Inter,sans-serif", fill: "var(--text2)", fontWeight: 500 }} />
            <Tooltip formatter={(v: number) => v.toFixed(1) + "%"} contentStyle={{ fontFamily: "Inter,sans-serif", fontSize: 12, borderRadius: 10, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }} />
            {periods.map(p => (
              <Radar key={p.key} name={p.label} dataKey={p.key} stroke={COLORS[p.key]} fill={COLORS[p.key]} fillOpacity={0.06} strokeWidth={2} dot={{ r: 3, fill: COLORS[p.key] }} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Metrik Karşılaştırma</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Metrik</th>
                {periods.map(p => (
                  <th key={p.key} style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, fontSize: 11, color: COLORS[p.key], textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.key} style={{ borderBottom: i < metrics.length - 1 ? "1px solid var(--border2)" : "none" }}>
                  <td style={{ padding: "12px 20px", fontWeight: 500, color: "var(--text2)" }}>{m.label}</td>
                  {periods.map(p => {
                    const val = p.data.profile.stats[m.key];
                    const vals = periods.map(pp => pp.data.profile.stats[m.key]);
                    const max = Math.max(...vals);
                    const isMax = val === max;
                    return (
                      <td key={p.key} style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontWeight: isMax ? 700 : 400, color: isMax ? COLORS[p.key] : "var(--text)", background: isMax ? COLORS[p.key] + "12" : "transparent", padding: "2px 8px", borderRadius: 6 }}>
                          {m.fmt(val)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top tracks comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {periods.map(p => (
          <div key={p.key} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[p.key] }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{p.label}</div>
            </div>
            {p.data.tracks.slice(0, 5).map((t: any, i: number) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "var(--text3)", width: 14, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                <img src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url} style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.artists?.[0]?.name}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { CharacterProfile } from "../types";

interface Props { shortProfile: CharacterProfile; mediumProfile: CharacterProfile; longProfile: CharacterProfile; tracks: any[]; artists: any[]; }

const PALETTE = ["#0071e3","#34c759","#af52de","#ff9f0a","#ff2d55","#5e5ce6","#30d158","#ffd60a"];

const isDarkMode = () => document.documentElement.getAttribute("data-theme") === "dark";

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const dark = isDarkMode();
  return (
    <div style={{ background: dark ? "#2c2c2e" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", fontFamily: "Inter,sans-serif", fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: dark ? "#f5f5f7" : "#1d1d1f" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{p.name}</span>
          <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export const StatsCharts = ({ shortProfile, mediumProfile, longProfile, tracks, artists }: Props) => {
  const dark = isDarkMode();
  const grid = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const tick = { fontSize: 11, fontFamily: "Inter,sans-serif", fill: dark ? "#636366" : "#aeaeb2", fontWeight: 500 as const };
  const tickSm = { ...tick, fontSize: 10 };

  const periodData = [
    { name: "4 Hafta", enerji: +(shortProfile.stats.avgEnergy*100).toFixed(1), ruhHali: +(shortProfile.stats.avgValence*100).toFixed(1), tempo: +shortProfile.stats.avgTempo.toFixed(0) },
    { name: "6 Ay",    enerji: +(mediumProfile.stats.avgEnergy*100).toFixed(1), ruhHali: +(mediumProfile.stats.avgValence*100).toFixed(1), tempo: +mediumProfile.stats.avgTempo.toFixed(0) },
    { name: "Tüm Zaman", enerji: +(longProfile.stats.avgEnergy*100).toFixed(1), ruhHali: +(longProfile.stats.avgValence*100).toFixed(1), tempo: +longProfile.stats.avgTempo.toFixed(0) },
  ];

  const genreMap: Record<string, number> = {};
  artists.forEach((a: any) => { a.genres?.slice(0, 2).forEach((g: string) => { genreMap[g] = (genreMap[g] || 0) + 1; }); });
  const genreData = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

  // Top 10 tracks — use rank as metric since Spotify popularity may be 0 for local/Turkish tracks
  const popularityData = tracks.slice(0, 10).map((t: any, i: number) => ({
    name: t.name.slice(0, 16) + (t.name.length > 16 ? "…" : ""),
    // Rank score: position 1 = 100, position 10 = ~55 (logarithmic)
    rank: Math.round(100 - i * 5),
    popularity: (t.popularity as number) || 0,
    artist: t.artists?.[0]?.name ?? "",
  }));
  const hasRealPopularity = tracks.slice(0, 10).some((t: any) => (t.popularity || 0) > 0);

  const tooltipStyle = {
    contentStyle: { background: dark ? "#2c2c2e" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: 12, fontSize: 12, fontFamily: "Inter,sans-serif" },
    labelStyle: { color: dark ? "#f5f5f7" : "#1d1d1f", fontWeight: 600 },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Energy & Mood period cards */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Enerji & Ruh Hali</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>3 dönem karşılaştırması</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {periodData.map((p, pi) => {
              const colors = ["#0071e3", "#34c759", "#af52de"];
              const c = colors[pi];
              return (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text3)" }}>{p.tempo} BPM</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>
                        <span>Enerji</span><span style={{ color: c, fontWeight: 600 }}>{p.enerji.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.enerji}%`, background: c, borderRadius: 3, transition: "width 1s ease" }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>
                        <span>Ruh Hali</span><span style={{ color: c, fontWeight: 600 }}>{p.ruhHali.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.ruhHali}%`, background: c, opacity: 0.7, borderRadius: 3, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tempo trend */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Tempo Değişimi</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>BPM trendi</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={periodData}>
              <CartesianGrid strokeDasharray="3 6" stroke={grid} vertical={false} />
              <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
              <YAxis tick={tickSm} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} BPM`, "Tempo"]} />
              <Line dataKey="tempo" name="Tempo" stroke="#af52de" strokeWidth={2.5}
                dot={{ r: 5, fill: "#af52de", stroke: dark ? "#1c1c1e" : "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Genre pie */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Tür Dağılımı</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>Top sanatçılara göre</div>
          {genreData.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {artists.slice(0, 6).map((a: any, i: number) => {
                const pop = typeof a.popularity === "number" ? a.popularity : 0;
                return (
                  <div key={a.id ?? i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 11, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{a.name}</span>
                        <span style={{ fontSize: 10, color: PALETTE[i % PALETTE.length], fontWeight: 600, flexShrink: 0 }}>{pop}/100</span>
                      </div>
                      <div style={{ height: 4, background: "var(--bg)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${pop}%`, background: PALETTE[i % PALETTE.length], borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, textAlign: "center" }}>Tür bilgisi mevcut değil — popülarite gösteriliyor</div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <PieChart width={140} height={140}>
                <Pie data={genreData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {genreData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: any, n: any, p: any) => [p.payload.name, `${v} sanatçı`]} />
              </PieChart>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                {genreData.map((g, i) => (
                  <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{g.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", flexShrink: 0 }}>{g.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Track popularity / rank */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
            {hasRealPopularity ? "Parça Popülaritesi" : "Top Parçalar Sıralaması"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
            {hasRealPopularity ? "Top 10 — Spotify skoru (0–100)" : "Top 10 — Dinleme sıralaması"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {popularityData.map((t, i) => {
              const val = hasRealPopularity ? t.popularity : t.rank;
              const pct = hasRealPopularity ? val : (val / 100) * 100;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--text3)", width: 14, textAlign: "right", flexShrink: 0 }}>#{i+1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{t.name}</span>
                      {hasRealPopularity && <span style={{ fontSize: 10, color: "#ff9f0a", fontWeight: 600, flexShrink: 0 }}>{t.popularity}/100</span>}
                    </div>
                    <div style={{ height: 4, background: "var(--bg)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#ff9f0a", borderRadius: 2, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

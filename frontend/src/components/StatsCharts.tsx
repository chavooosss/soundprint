import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { CharacterProfile } from "../types";

interface Props { shortProfile: CharacterProfile; mediumProfile: CharacterProfile; longProfile: CharacterProfile; tracks: any[]; artists: any[]; }

const PALETTE = ["#0071e3","#34c759","#af52de","#ff9f0a","#ff2d55","#5e5ce6","#30d158","#ffd60a"];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", boxShadow: "var(--shadow-md)", fontFamily: "Inter,sans-serif", fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}</div>)}
    </div>
  );
};

export const StatsCharts = ({ shortProfile, mediumProfile, longProfile, tracks, artists }: Props) => {
  const periodData = [
    { name: "4 Hafta", enerji: +(shortProfile.stats.avgEnergy*100).toFixed(1), ruhHali: +(shortProfile.stats.avgValence*100).toFixed(1), tempo: +shortProfile.stats.avgTempo.toFixed(0) },
    { name: "6 Ay",    enerji: +(mediumProfile.stats.avgEnergy*100).toFixed(1), ruhHali: +(mediumProfile.stats.avgValence*100).toFixed(1), tempo: +mediumProfile.stats.avgTempo.toFixed(0) },
    { name: "Tüm Zaman",enerji: +(longProfile.stats.avgEnergy*100).toFixed(1), ruhHali: +(longProfile.stats.avgValence*100).toFixed(1), tempo: +longProfile.stats.avgTempo.toFixed(0) },
  ];

  const genreMap: Record<string, number> = {};
  artists.forEach((a: any) => { a.genres?.slice(0, 2).forEach((g: string) => { genreMap[g] = (genreMap[g] || 0) + 1; }); });
  const genreData = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

  const popularityData = tracks.slice(0, 10).map((t: any) => ({ name: t.name.slice(0, 18) + (t.name.length > 18 ? "…" : ""), popülarite: t.popularity ?? 60, artist: t.artists?.[0]?.name }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Energy over periods */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Enerji & Ruh Hali Trendi</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>3 dönem karşılaştırması</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={periodData} barGap={4}>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Inter,sans-serif", fill: "var(--text2)", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="enerji" fill="#0071e3" radius={[5,5,0,0]} maxBarSize={32} />
              <Bar dataKey="ruhHali" fill="#34c759" radius={[5,5,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tempo over periods */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Tempo Değişimi</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>BPM trendi</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={periodData}>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Inter,sans-serif", fill: "var(--text2)", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Tooltip content={<Tip />} />
              <Line dataKey="tempo" stroke="#af52de" strokeWidth={2.5} dot={{ r: 5, fill: "#af52de", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Genre pie */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Tür Dağılımı</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>Top sanatçılara göre</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {genreData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
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
        </div>

        {/* Track popularity */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Parça Popülaritesi</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>Top 10 — Spotify skoru</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={popularityData} layout="vertical" barSize={8}>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(0,0,0,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fontFamily: "Inter,sans-serif", fill: "var(--text2)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="popülarite" fill="#ff9f0a" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

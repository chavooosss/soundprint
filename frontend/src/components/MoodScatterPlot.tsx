import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { AudioStats } from "../types";

interface Props { data: AudioStats["moodGenreMatrix"]; }

const P = ["#0071e3","#34c759","#af52de","#ff9f0a","#ff2d55","#5e5ce6","#30d158","#ffd60a"];
const gc = (g?: string) => {
  if (!g || g === "Unknown") return "#8e8e93";
  let h = 0;
  for (let i = 0; i < g.length; i++) h = g.charCodeAt(i) + ((h << 5) - h);
  return P[Math.abs(h) % P.length];
};

// Deterministic jitter based on string hash so it doesn't change on re-render
const hashJitter = (s: string, seed: number, range: number) => {
  let h = seed;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return ((h % 1000) / 1000 - 0.5) * range * 2;
};

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", boxShadow: "var(--shadow-md)", fontFamily: "Inter,sans-serif", fontSize: 12, maxWidth: 200 }}>
      <div style={{ fontWeight: 700, color: gc(d.genre), marginBottom: 3 }}>{d.genre || "Bilinmeyen Tür"}</div>
      <div style={{ color: "var(--text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.trackName}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <span style={{ fontSize: 10, color: "var(--text3)" }}>Enerji <strong style={{ color: "var(--text2)" }}>{(d._energy * 100).toFixed(0)}%</strong></span>
        <span style={{ fontSize: 10, color: "var(--text3)" }}>Mod <strong style={{ color: "var(--text2)" }}>{(d._valence * 100).toFixed(0)}%</strong></span>
      </div>
    </div>
  );
};

const QUADRANTS = [
  { x: 0.75, y: 0.75, label: "Enerjik & Mutlu", color: "#34c759" },
  { x: 0.25, y: 0.75, label: "Enerjik & Karanlık", color: "#ff3b30" },
  { x: 0.75, y: 0.25, label: "Sakin & Pozitif", color: "#0071e3" },
  { x: 0.25, y: 0.25, label: "Sakin & Melankolik", color: "#af52de" },
];

export const MoodScatterPlot = ({ data }: Props) => {
  if (!data?.length) return (
    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 12 }}>
      Veri yok
    </div>
  );

  // Apply jitter so same-genre tracks don't stack exactly on top of each other
  const jittered = data.map((d) => ({
    ...d,
    _energy: d.energy,
    _valence: d.valence,
    energy: Math.max(0.02, Math.min(0.98, d.energy + hashJitter(d.trackId, 1, 0.06))),
    valence: Math.max(0.02, Math.min(0.98, d.valence + hashJitter(d.trackId, 2, 0.06))),
  }));

  return (
    <div style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 8" stroke="rgba(128,128,128,0.12)" />
          <XAxis dataKey="valence" type="number" domain={[0, 1]} name="Ruh Hali"
            tick={{ fontSize: 10, fill: "var(--text3)", fontFamily: "Inter,sans-serif" }}
            tickLine={false} axisLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <YAxis dataKey="energy" type="number" domain={[0, 1]} name="Enerji"
            tick={{ fontSize: 10, fill: "var(--text3)", fontFamily: "Inter,sans-serif" }}
            tickLine={false} axisLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <ReferenceLine x={0.5} stroke="rgba(128,128,128,0.2)" strokeDasharray="4 4" />
          <ReferenceLine y={0.5} stroke="rgba(128,128,128,0.2)" strokeDasharray="4 4" />
          <Tooltip content={<Tip />} cursor={{ strokeDasharray: "3 3", stroke: "rgba(128,128,128,0.3)" }} />
          <Scatter data={jittered} shape={(props: any) => {
            const { cx, cy, payload } = props;
            const color = gc(payload.genre);
            return (
              <circle cx={cx} cy={cy} r={5} fill={color} fillOpacity={0.85}
                stroke={color} strokeWidth={1.5} strokeOpacity={0.3} />
            );
          }}>
            {jittered.map((d, i) => <Cell key={i} fill={gc(d.genre)} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant labels */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", padding: "4px 4px 0 32px" }}>
        <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, color: "#34c759", opacity: 0.6, fontWeight: 600 }}>Enerjik & Mutlu ↗</div>
        <div style={{ position: "absolute", top: 8, left: 32, fontSize: 9, color: "#ff3b30", opacity: 0.6, fontWeight: 600 }}>↖ Enerjik & Karanlık</div>
        <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 9, color: "#0071e3", opacity: 0.6, fontWeight: 600 }}>Sakin & Pozitif ↘</div>
        <div style={{ position: "absolute", bottom: 4, left: 32, fontSize: 9, color: "#af52de", opacity: 0.6, fontWeight: 600 }}>↙ Melankolik</div>
      </div>
    </div>
  );
};

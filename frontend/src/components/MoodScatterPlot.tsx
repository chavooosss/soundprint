import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { AudioStats } from "../types";
interface Props { data: AudioStats["moodGenreMatrix"]; }
const P = ["#0071e3","#34c759","#af52de","#ff9f0a","#ff2d55","#5e5ce6","#30d158","#ffd60a"];
const gc = (g?: string) => { if(!g) return "#ccc"; let h=0; for(let i=0;i<g.length;i++) h=g.charCodeAt(i)+((h<<5)-h); return P[Math.abs(h)%P.length]; };
const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", boxShadow: "var(--shadow-md)", fontFamily: "Inter,sans-serif", fontSize: 12, maxWidth: 200 }}><div style={{ fontWeight: 700, color: gc(d.genre), marginBottom: 3 }}>{d.genre||"—"}</div><div style={{ color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.trackName}</div><div style={{ color: "var(--text3)", fontSize: 11 }}>E:{(d.energy*100).toFixed(0)}% V:{(d.valence*100).toFixed(0)}%</div></div>;
};
export const MoodScatterPlot = ({ data }: Props) => {
  if (!data?.length) return <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 12 }}>Veri yok</div>;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <ScatterChart margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 8" stroke="rgba(0,0,0,0.04)" />
        <XAxis dataKey="valence" type="number" domain={[0,1]} tick={{ fontSize: 10, fill: "var(--text3)", fontFamily: "Inter,sans-serif" }} tickLine={false} axisLine={false} />
        <YAxis dataKey="energy" type="number" domain={[0,1]} tick={{ fontSize: 10, fill: "var(--text3)", fontFamily: "Inter,sans-serif" }} tickLine={false} axisLine={false} />
        <ReferenceLine x={0.5} stroke="rgba(0,0,0,0.06)" /><ReferenceLine y={0.5} stroke="rgba(0,0,0,0.06)" />
        <Tooltip content={<Tip />} cursor={false} />
        <Scatter data={data}>{data.map((d,i)=><Cell key={i} fill={gc(d.genre)} fillOpacity={0.85}/>)}</Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

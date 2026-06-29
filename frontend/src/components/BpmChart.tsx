import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { AudioStats } from "../types";
interface Props { data: AudioStats["tempoOverTime"]; avgTempo: number; }
const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", boxShadow: "var(--shadow-md)", fontFamily: "Inter,sans-serif", fontSize: 12 }}><div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 2 }}>{d.tempo} BPM</div><div style={{ color: "var(--text2)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.trackName}</div></div>;
};
export const BpmChart = ({ data, avgTempo }: Props) => (
  <ResponsiveContainer width="100%" height={180}>
    <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0071e3" stopOpacity={0.12}/><stop offset="95%" stopColor="#0071e3" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="3 8" stroke="rgba(0,0,0,0.04)" />
      <XAxis dataKey="index" hide />
      <YAxis domain={["auto","auto"]} tick={{ fontSize: 10, fill: "var(--text3)", fontFamily: "Inter,sans-serif" }} tickLine={false} axisLine={false} />
      <Tooltip content={<Tip />} />
      <ReferenceLine y={avgTempo} stroke="rgba(0,113,227,0.2)" strokeDasharray="4 6" />
      <Area type="monotone" dataKey="tempo" stroke="#0071e3" strokeWidth={2} fill="url(#bg)" dot={false} activeDot={{ r: 4, fill: "#0071e3", stroke: "#fff", strokeWidth: 2 }} />
    </AreaChart>
  </ResponsiveContainer>
);

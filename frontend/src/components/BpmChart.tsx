import type { AudioStats } from "../types";

interface Props { data: AudioStats["tempoOverTime"]; avgTempo: number; }

const ZONES = [
  { label: "Yavaş",  min: 60,  max: 90,  color: "#5e5ce6" },
  { label: "Orta",   min: 90,  max: 120, color: "#34c759" },
  { label: "Hızlı",  min: 120, max: 150, color: "#ff9f0a" },
  { label: "Çok Hızlı", min: 150, max: 200, color: "#ff3b30" },
];

const MIN_BPM = 60;
const MAX_BPM = 200;
const ARC_DEG = 240;
const START_DEG = 150; // start at bottom-left

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const s = polar(cx, cy, r, from);
  const e = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

const bpmAngle = (bpm: number) =>
  START_DEG + ((Math.max(MIN_BPM, Math.min(MAX_BPM, bpm)) - MIN_BPM) / (MAX_BPM - MIN_BPM)) * ARC_DEG;

export const BpmChart = ({ data, avgTempo }: Props) => {
  if (!data?.length) return (
    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 12 }}>
      Veri yok
    </div>
  );

  const cx = 100, cy = 105, R = 72, rInner = 52;
  const needleAngle = bpmAngle(avgTempo);
  const needleTip = polar(cx, cy, R - 10, needleAngle);
  const needleBase1 = polar(cx, cy, 8, needleAngle + 90);
  const needleBase2 = polar(cx, cy, 8, needleAngle - 90);

  const tempos = data.map((d) => d.tempo);
  const minT = Math.min(...tempos);
  const maxT = Math.max(...tempos);

  const zone = ZONES.find((z) => avgTempo >= z.min && avgTempo < z.max) ?? ZONES[ZONES.length - 1];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={200} height={140} style={{ flexShrink: 0, overflow: "visible" }}>
        {/* Track (background arc) */}
        <path d={arc(cx, cy, R, START_DEG, START_DEG + ARC_DEG)} fill="none"
          stroke="rgba(128,128,128,0.12)" strokeWidth={14} strokeLinecap="round" />

        {/* Colored zone arcs */}
        {ZONES.map((z) => {
          const from = bpmAngle(z.min);
          const to = bpmAngle(Math.min(z.max, MAX_BPM));
          return (
            <path key={z.label} d={arc(cx, cy, R, from, to)} fill="none"
              stroke={z.color} strokeWidth={14} strokeLinecap="butt" opacity={0.25} />
          );
        })}

        {/* Active fill up to current BPM */}
        <path d={arc(cx, cy, R, START_DEG, needleAngle)} fill="none"
          stroke={zone.color} strokeWidth={14} strokeLinecap="round" />

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={zone.color} opacity={0.9}
        />
        <circle cx={cx} cy={cy} r={7} fill="var(--surface)" stroke={zone.color} strokeWidth={2} />

        {/* BPM label */}
        <text x={cx} y={cy + 30} textAnchor="middle" fill={zone.color}
          fontSize={28} fontWeight={800} fontFamily="Inter,sans-serif">{Math.round(avgTempo)}</text>
        <text x={cx} y={cy + 46} textAnchor="middle" fill="var(--text3)"
          fontSize={11} fontWeight={500} fontFamily="Inter,sans-serif">BPM</text>
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Zone legend */}
        {ZONES.map((z) => {
          const active = avgTempo >= z.min && avgTempo < z.max;
          return (
            <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color, opacity: active ? 1 : 0.3, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? z.color : "var(--text3)", flex: 1 }}>{z.label}</span>
              <span style={{ fontSize: 10, color: "var(--text3)" }}>{z.min}–{z.max === 200 ? "200+" : z.max}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 4, paddingTop: 8, borderTop: "1px solid var(--border2)", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>En Düşük</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>{Math.round(minT)} BPM</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>En Yüksek</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>{Math.round(maxT)} BPM</div>
          </div>
        </div>
      </div>
    </div>
  );
};

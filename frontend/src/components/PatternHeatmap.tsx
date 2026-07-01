import type { CharacterProfile } from "../types";
interface Props { recent: any[]; tracks: any[]; profile: CharacterProfile; }

const DAYS  = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TIME_SECTIONS = [
  { label: "Gece",  range: "00–06", color: "#818cf8", from: 0,  to: 6  },
  { label: "Sabah", range: "06–12", color: "#fbbf24", from: 6,  to: 12 },
  { label: "Öğle",  range: "12–18", color: "#34d399", from: 12, to: 18 },
  { label: "Akşam", range: "18–24", color: "#fb7185", from: 18, to: 24 },
];

const buildGrid = (recent: any[]) => {
  const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  let hasData = false, earliest: Date | null = null, latest: Date | null = null;
  recent.forEach((t: any) => {
    if (!t.played_at) return;
    hasData = true;
    const d   = new Date(t.played_at);
    const ist = new Date(d.getTime() + 3 * 60 * 60 * 1000);
    g[(ist.getUTCDay() + 6) % 7][ist.getUTCHours()]++;
    if (!earliest || d < earliest) earliest = d;
    if (!latest   || d > latest)   latest   = d;
  });
  return { grid: g, hasRealData: hasData, earliest, latest };
};

const Bar = ({
  value, max, color, label, sublabel, count, isPeak,
}: {
  value: number; max: number; color: string; label: string;
  sublabel?: string; count: number; isPeak?: boolean;
}) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: 11, fontWeight: isPeak ? 800 : 500, color: isPeak ? color : "var(--text2)" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 9, color: "var(--text3)" }}>{sublabel}</div>}
      </div>
      <div style={{ flex: 1, height: 28, background: "rgba(255,255,255,0.05)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: isPeak
            ? `linear-gradient(90deg, ${color}90, ${color})`
            : `linear-gradient(90deg, ${color}40, ${color}70)`,
          borderRadius: 8,
          transition: "width 1s cubic-bezier(.16,1,.3,1)",
          boxShadow: isPeak ? `0 0 12px ${color}50` : "none",
        }} />
        {isPeak && (
          <div style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
          }}>PEAK</div>
        )}
      </div>
      <div style={{ width: 28, textAlign: "right", fontSize: 12, fontWeight: 600, color: count > 0 ? "var(--text1)" : "var(--text3)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
        {count}
      </div>
    </div>
  );
};

export const PatternHeatmap = ({ recent, tracks, profile }: Props) => {
  const { grid, hasRealData, earliest, latest } = buildGrid(recent);

  const dateRangeLabel = (() => {
    if (!earliest || !latest) return null;
    const fmt = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    const e = fmt(earliest), l = fmt(latest);
    return e === l ? e : `${e} – ${l}`;
  })();

  const dayTotals  = grid.map(r => r.reduce((s, v) => s + v, 0));
  const maxDay     = Math.max(...dayTotals, 1);
  const peakDay    = dayTotals.reduce((mi, v, i) => v > dayTotals[mi] ? i : mi, 0);
  const colSum     = HOURS.map(h => grid.reduce((s, r) => s + r[h], 0));
  const secTotals  = TIME_SECTIONS.map(s => HOURS.slice(s.from, s.to).reduce((a, h) => a + colSum[h], 0));
  const maxSec     = Math.max(...secTotals, 1);
  const peakSec    = secTotals.reduce((mi, v, i) => v > secTotals[mi] ? i : mi, 0);
  const totalPlays = dayTotals.reduce((a, v) => a + v, 0);

  // peak hour (2-hour window)
  const windowSum  = HOURS.map(h => colSum[h] + colSum[(h + 1) % 24]);
  const pwStart    = windowSum.reduce((mi, v, i) => v > windowSum[mi] ? i : mi, 0);
  const peakHour   = windowSum[pwStart] > 0
    ? (colSum[pwStart] >= colSum[(pwStart + 1) % 24] ? pwStart : (pwStart + 1) % 24)
    : 0;

  const fmtH = (h: number) => `${String(h).padStart(2, "0")}:00`;
  const peakSecColor = TIME_SECTIONS[peakSec]?.color ?? "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── STAT CARDS ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          {
            icon: "📅", label: "Peak Gün",
            value: DAYS[peakDay],
            sub: `${dayTotals[peakDay]} şarkı · en yoğun gün`,
            grad: "135deg,#7c3aed,#4f46e5",
          },
          {
            icon: "⏰", label: "Peak Saat",
            value: fmtH(peakHour),
            sub: `${TIME_SECTIONS.find(s => peakHour >= s.from && peakHour < s.to)?.label} · ${colSum[peakHour] + colSum[(peakHour+1)%24]} şarkı`,
            grad: "135deg,#3b82f6,#06b6d4",
          },
          {
            icon: "🎵", label: "Son Dinlenenler",
            value: `${recent.length}`,
            sub: recent[0]?.name?.slice(0, 26) ?? "—",
            grad: "135deg,#10b981,#059669",
          },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", background: `linear-gradient(${s.grad})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: 14 }}>

        {/* ── MAIN ANALYTICS CARD ──────────────────────────────── */}
        <div className="card" style={{ padding: 24 }}>

          {/* card header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Dinleme Analizi</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                {dateRangeLabel ? `${dateRangeLabel} · ${recent.length} şarkı` : "Son dinleme verisi"}
              </div>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
              color: hasRealData ? "#34d399" : "#fb923c",
              background: hasRealData ? "rgba(52,211,153,.1)" : "rgba(251,146,60,.1)",
              border: `1px solid ${hasRealData ? "rgba(52,211,153,.25)" : "rgba(251,146,60,.25)"}`,
            }}>
              {hasRealData ? `✓ ${totalPlays} kayıt` : "Veri yok"}
            </div>
          </div>

          {/* ─ Haftanın Günleri ─ */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              Haftanın Günleri
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DAYS.map((day, di) => (
                <Bar
                  key={day}
                  label={day}
                  value={dayTotals[di]}
                  max={maxDay}
                  color="#7c3aed"
                  count={dayTotals[di]}
                  isPeak={di === peakDay && dayTotals[di] > 0}
                />
              ))}
            </div>
          </div>

          {/* ─ Günün Saatleri ─ */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              Günün Saatleri
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TIME_SECTIONS.map((s, i) => (
                <Bar
                  key={s.label}
                  label={s.label}
                  sublabel={s.range}
                  value={secTotals[i]}
                  max={maxSec}
                  color={s.color}
                  count={secTotals[i]}
                  isPeak={i === peakSec && secTotals[i] > 0}
                />
              ))}
            </div>
          </div>

          {/* ─ Son Çalınanlar ─ */}
          {recent.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                Son Çalınanlar
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recent.slice(0, 5).map((t: any, i: number) => (
                  <div key={t.id ?? i}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 8px", borderRadius: 10, transition: "background .15s", cursor: "default" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 11, color: "var(--text3)", width: 16, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                    <img
                      src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url}
                      style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                      alt=""
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.artists?.[0]?.name}</div>
                    </div>
                    {t.played_at && (
                      <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                        {new Date(t.played_at).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18 }}>Ses Profili</div>
            {[
              { label: "Enerji",       val: profile.stats.avgEnergy,           c: "#3b82f6" },
              { label: "Ruh Hali",     val: profile.stats.avgValence,          c: "#10b981" },
              { label: "Dans",         val: profile.stats.avgDanceability,     c: "#ec4899" },
              { label: "Akustik",      val: profile.stats.avgAcousticness,     c: "#f59e0b" },
              { label: "Enstrümantal", val: profile.stats.avgInstrumentalness, c: "#a855f7" },
            ].map(b => (
              <div key={b.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: "var(--text2)", fontWeight: 500 }}>{b.label}</span>
                  <span style={{ color: b.c, fontWeight: 700 }}>{(b.val * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  <div style={{
                    height: "100%", width: `${b.val * 100}%`,
                    background: `linear-gradient(90deg,${b.c}60,${b.c})`,
                    borderRadius: 3,
                    transition: "width 1.4s cubic-bezier(.16,1,.3,1)",
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Müzik Karakterin</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 8, color: "var(--accent)" }}>{profile.archetype}</div>
            <p style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 14px" }}>{profile.description}</p>
            <div style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(167,139,250,0.7)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Odaklanma Parametreleri</div>
              <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 2 }}>
                ~{Math.round(profile.studyPlaylistParams.targetTempo)} BPM &nbsp;·&nbsp;
                {(profile.studyPlaylistParams.targetEnergy * 100).toFixed(0)}% enerji
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

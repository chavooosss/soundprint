import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import WebGLFluid from "webgl-fluid";
import type { CharacterProfile } from "../types";

interface Props { profile: CharacterProfile; artists: any[]; tracks: any[]; }

const ARCHETYPE_STYLE: Record<string, { emoji: string; gradient: string; glow: [string, string] }> = {
  "The Warrior":        { emoji: "⚔️", gradient: "160deg,#7f1d1d,#2c0a0a", glow: ["#f97316", "#dc2626"] },
  "The Shadow Runner":  { emoji: "🌑", gradient: "160deg,#312e81,#0b1023", glow: ["#6366f1", "#1e3a8a"] },
  "The Night Owl":      { emoji: "🦉", gradient: "160deg,#3730a3,#160f36", glow: ["#818cf8", "#4338ca"] },
  "The Hype Beast":     { emoji: "🔥", gradient: "160deg,#be185d,#4c1d95", glow: ["#ec4899", "#a855f7"] },
  "The Groove Master":  { emoji: "🕺", gradient: "160deg,#7c3aed,#1e3a8a", glow: ["#c084fc", "#3b82f6"] },
  "The Optimist":       { emoji: "☀️", gradient: "160deg,#f59e0b,#9a3412", glow: ["#fde047", "#fb923c"] },
  "The Soul Searcher":  { emoji: "🌊", gradient: "160deg,#0e7490,#0c2233", glow: ["#22d3ee", "#0891b2"] },
  "The Connoisseur":    { emoji: "🎻", gradient: "160deg,#92400e,#271203", glow: ["#fbbf24", "#92400e"] },
  "The Deep Thinker":   { emoji: "🌙", gradient: "160deg,#334155,#0a0e18", glow: ["#818cf8", "#334155"] },
  "The Flow State":     { emoji: "🍃", gradient: "160deg,#0d9488,#042f2c", glow: ["#5eead4", "#0d9488"] },
};
const DEFAULT_STYLE = { emoji: "🎧", gradient: "160deg,#0071e3,#0a2540", glow: ["#60a5fa", "#2563eb"] as [string, string] };

const hexToFloatRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
};

// SVG fractal-noise grain, embedded so html-to-image can capture it without a network fetch
const GRAIN_URL = "data:image/svg+xml;base64," + btoa(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
);

const SLIDES = [
  { id: "archetype", label: "Karakter" },
  { id: "artists",   label: "Sanatçılar" },
  { id: "tracks",    label: "Parçalar" },
  { id: "stats",     label: "Ses DNA" },
] as const;

const Brand = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.9, position: "relative", zIndex: 2, pointerEvents: "none" }}>
    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>SOUNDPRİNT</span>
    <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{new Date().getFullYear()}</span>
  </div>
);

const Rank = ({ n }: { n: number }) => (
  <div style={{
    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
    background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800,
  }}>{n}</div>
);

export const ShareCard = ({ profile, artists, tracks }: Props) => {
  const [slide, setSlide] = useState(0);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const style = ARCHETYPE_STYLE[profile.archetype] ?? DEFAULT_STYLE;
  const [glowA, glowB] = style.glow;
  const energy = profile.stats.avgEnergy;

  // Kişiliğe göre renklenen, imleç/dokunuşla etkileşen akışkan simülasyon arkaplanı
  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      WebGLFluid(canvasRef.current, {
        TRIGGER: "hover",
        IMMEDIATE: false,
        AUTO: false,
        SPLAT_COLOR: hexToFloatRgb(glowA),
        COLORFUL: false,
        SPLAT_RADIUS: 0.18,
        SPLAT_FORCE: 3500,
        DENSITY_DISSIPATION: 4,
        VELOCITY_DISSIPATION: 2.5,
        BACK_COLOR: hexToFloatRgb(style.gradient.split(",")[2] ?? "#0a0a12"),
        TRANSPARENT: false,
        BLOOM: false,
        SUNRAYS: false,
      });
    } catch {
      // WebGL desteklenmiyorsa sessizce CSS gradient fallback'e düş
    }
  }, [glowA, style.gradient]);

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `soundprint-${SLIDES[slide].id}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPng = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
    return (await fetch(dataUrl)).blob();
  };

  const handleDownload = async () => {
    setBusy(true);
    try { const blob = await renderPng(); if (blob) downloadBlob(blob); }
    finally { setBusy(false); }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await renderPng();
      if (!blob) return;
      const file = new File([blob], `soundprint-${SLIDES[slide].id}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Soundprint", text: "Müziğim beni nasıl tanımlıyor?" });
      } else {
        downloadBlob(blob);
      }
    } catch {
      // kullanıcı paylaşımı iptal etti — sessizce geç
    } finally { setBusy(false); }
  };

  // Enerjiye göre daha yoğun/parlak, sakin karakterlerde daha yumuşak/dağınık glow
  const glowIntensity = 0.35 + energy * 0.35;
  const glowSpread = 55 - energy * 15;

  const cardBase: React.CSSProperties = {
    width: 320, height: 568, borderRadius: 24, padding: 28,
    display: "flex", flexDirection: "column", color: "#fff",
    fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden",
    background: `
      radial-gradient(circle at 12% 15%, ${glowA}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")}, transparent ${glowSpread}%),
      radial-gradient(circle at 90% 12%, ${glowB}${Math.round(glowIntensity * 200).toString(16).padStart(2, "0")}, transparent ${glowSpread + 5}%),
      radial-gradient(circle at 50% 100%, ${glowA}33, transparent 60%),
      linear-gradient(${style.gradient})
    `,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div ref={cardRef} style={cardBase}>
        {/* fluid simulation background — hover/tap üzerinde dalgalanır, kişilik rengiyle boyanır */}
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 24 }} />

        {/* grain overlay */}
        <div style={{
          position: "absolute", inset: 0, backgroundImage: `url(${GRAIN_URL})`,
          opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none",
        }} />

        <Brand />

        {SLIDES[slide].id === "archetype" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, position: "relative", zIndex: 2, pointerEvents: "none" }}>
            <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: `radial-gradient(circle, ${glowA}99, transparent 70%)`,
                filter: "blur(14px)",
              }} />
              <div style={{ fontSize: 56, position: "relative" }}>{style.emoji}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Müzik Karakterin</div>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: `0 2px 24px ${glowA}70` }}>{profile.archetype}</div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9, margin: 0 }}>{profile.description}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {[
                { l: "Enerji", v: profile.stats.avgEnergy },
                { l: "Pozitiflik", v: profile.stats.avgValence },
              ].map(s => (
                <div key={s.l} style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, opacity: 0.75, fontWeight: 600, textTransform: "uppercase" }}>{s.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{(s.v * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {SLIDES[slide].id === "artists" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, position: "relative", zIndex: 2, pointerEvents: "none" }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Top 5 Sanatçın 🎤</div>
            {artists.slice(0, 5).map((a: any, i: number) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Rank n={i + 1} />
                {a.images?.[2] ? <img crossOrigin="anonymous" src={a.images[2].url} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />
                  : <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.genres?.[0] ?? ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {SLIDES[slide].id === "tracks" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, position: "relative", zIndex: 2, pointerEvents: "none" }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Top 5 Parçan 🎵</div>
            {tracks.slice(0, 5).map((t: any, i: number) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Rank n={i + 1} />
                <img crossOrigin="anonymous" src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.artists?.map((a: any) => a.name).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {SLIDES[slide].id === "stats" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, position: "relative", zIndex: 2, pointerEvents: "none" }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Ses DNA'n 🧬</div>
            {[
              { l: "Enerji", v: profile.stats.avgEnergy },
              { l: "Ruh Hali", v: profile.stats.avgValence },
              { l: "Dansedilebilirlik", v: profile.stats.avgDanceability },
              { l: "Akustiklik", v: profile.stats.avgAcousticness },
            ].map(s => (
              <div key={s.l}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ opacity: 0.85, fontWeight: 500 }}>{s.l}</span>
                  <span style={{ fontWeight: 800 }}>{(s.v * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${s.v * 100}%`, background: `linear-gradient(90deg, ${glowB}, ${glowA})`, borderRadius: 3, boxShadow: `0 0 8px ${glowA}90` }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.85 }}>Ortalama Tempo: <b>{Math.round(profile.stats.avgTempo)} BPM</b></div>
          </div>
        )}

        <div style={{ fontSize: 10, opacity: 0.6, textAlign: "center", position: "relative", zIndex: 2, pointerEvents: "none" }}>Müziğin seni nasıl tanımlıyor?</div>
      </div>

      {/* Slide dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => setSlide(i)}
            style={{ width: 8, height: 8, borderRadius: "50%", border: "none", padding: 0, background: i === slide ? "var(--accent)" : "var(--border)" }} />
        ))}
      </div>

      {/* Navigation + actions */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: slide === 0 ? "default" : "pointer", opacity: slide === 0 ? 0.4 : 1 }}>‹</button>
        <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, minWidth: 70, textAlign: "center" }}>{SLIDES[slide].label}</span>
        <button onClick={() => setSlide(s => Math.min(SLIDES.length - 1, s + 1))} disabled={slide === SLIDES.length - 1}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: slide === SLIDES.length - 1 ? "default" : "pointer", opacity: slide === SLIDES.length - 1 ? 0.4 : 1 }}>›</button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleDownload} disabled={busy}
          style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", background: "rgba(0,113,227,0.08)", border: "1px solid rgba(0,113,227,0.2)", borderRadius: 8, padding: "8px 16px", cursor: busy ? "default" : "pointer" }}>
          {busy ? "Hazırlanıyor..." : "⬇ İndir"}
        </button>
        <button onClick={handleShare} disabled={busy}
          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: busy ? "default" : "pointer" }}>
          {busy ? "Hazırlanıyor..." : "↗ Paylaş"}
        </button>
      </div>
    </div>
  );
};

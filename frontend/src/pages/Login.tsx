import { authService } from "../services/api";
import { LogoIcon } from "../components/Logo";

const GRAIN_URL = "data:image/svg+xml;base64," + btoa(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
);

const EQ_BARS = [40, 70, 45, 85, 55, 95, 60, 75, 42, 65];

export const Login = () => (
  <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "#05060a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "var(--font)" }}>
    {/* Mesh gradient glow */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
      background: `
        radial-gradient(circle at 18% 22%, rgba(0,113,227,0.35), transparent 42%),
        radial-gradient(circle at 85% 12%, rgba(124,58,237,0.30), transparent 46%),
        radial-gradient(circle at 78% 82%, rgba(0,113,227,0.22), transparent 50%),
        radial-gradient(circle at 50% 105%, rgba(124,58,237,0.20), transparent 55%)
      `,
      animation: "meshDrift 14s ease-in-out infinite",
    }} />
    {/* Vignette */}
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    {/* Grain texture */}
    <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `url(${GRAIN_URL})`, opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }} />

    <style>{`
      @keyframes pulseGlow { 0%,100% { transform: scale(1); opacity: 0.65; } 50% { transform: scale(1.3); opacity: 1; } }
      @keyframes eqBar { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
      @keyframes meshDrift { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.08) translate(-1%, 1%); } }
    `}</style>

    {/* Logo */}
    <div style={{ marginBottom: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
      <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: -18, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,113,227,0.55), rgba(124,58,237,0.25) 55%, transparent 75%)", filter: "blur(16px)", animation: "pulseGlow 3s ease-in-out infinite" }} />
        <div style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)", borderRadius: 18, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          <LogoIcon size={64} />
        </div>
      </div>
      <div style={{ textAlign: "center", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "rgba(245,245,247,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Soundprint</div>
      </div>
    </div>

    {/* Hero */}
    <div style={{ maxWidth: 580, textAlign: "center", marginBottom: 48, position: "relative", zIndex: 1 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,6vw,56px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#f5f5f7", marginBottom: 16, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both", textShadow: "0 2px 40px rgba(0,113,227,0.25)" }}>
        Müziğin seni<br/>nasıl tanımlıyor?
      </h1>
      <p style={{ fontSize: 17, color: "rgba(245,245,247,0.6)", lineHeight: 1.7, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Dinleme verilerinden kişilik analizi, sanatçı ağı,<br/>
        haftalık pattern'lar ve yapay zeka yorumu.
      </p>
    </div>

    {/* CTA */}
    <div style={{ position: "relative", zIndex: 1, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
      <button onClick={authService.login} style={{ padding: "15px 34px", borderRadius: 980, background: "linear-gradient(135deg,#0071e3,#7c3aed)", border: "none", color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", boxShadow: "0 4px 24px rgba(0,113,227,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 32px rgba(124,58,237,0.55), 0 0 0 1px rgba(255,255,255,0.12) inset"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(0,113,227,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset"; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.42a.622.622 0 01-.857.208c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115.294.18.387.563.207.856zm1.243-2.765a.779.779 0 01-1.072.256c-2.687-1.652-6.785-2.13-9.965-1.166a.779.779 0 01-.974-.519.78.78 0 01.519-.975c3.632-1.102 8.147-.568 11.236 1.332a.779.779 0 01.256 1.072zm.107-2.88c-3.223-1.914-8.54-2.09-11.617-1.156a.935.935 0 01-.57-1.784c3.532-1.073 9.404-.866 13.115 1.338a.935.935 0 01-.928 1.602z"/></svg>
        Spotify ile Başla
      </button>
    </div>

    {/* Equalizer divider */}
    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", gap: 3, height: 20, marginTop: 36, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}>
      {EQ_BARS.map((h, i) => (
        <div key={i} style={{
          width: 3, height: `${h}%`, borderRadius: 2, background: "linear-gradient(180deg,#7c3aed,#0071e3)", opacity: 0.7,
          transformOrigin: "bottom", animation: `eqBar ${0.9 + (i % 4) * 0.15}s ease-in-out ${i * 0.06}s infinite`,
        }} />
      ))}
    </div>

    {/* Feature pills */}
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
      {["AI Kişilik Analizi","Sanatçı Ağı","DNA Görselleştirme","Dönem Karşılaştırma","Playlist Önerisi","Deep-Dive Sayfaları"].map(f => (
        <span key={f} style={{ padding: "6px 14px", borderRadius: 980, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 500, color: "rgba(245,245,247,0.75)", backdropFilter: "blur(8px)" }}>{f}</span>
      ))}
    </div>

    <div style={{ position: "relative", zIndex: 1, marginTop: 48, fontSize: 12, color: "rgba(245,245,247,0.4)", textAlign: "center", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
      Yalnızca okuma izinleri istenir · Veriler paylaşılmaz
    </div>
  </div>
);

import { authService } from "../services/api";

const GRAIN_URL = "data:image/svg+xml;base64," + btoa(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
);

const EQ_BARS = [40, 70, 45, 85, 55, 95, 60, 75, 42, 65];

export const Login = () => (
  <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "var(--font)" }}>
    {/* Ambient glow */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
      background: `
        radial-gradient(circle at 15% 20%, rgba(0,113,227,0.14), transparent 40%),
        radial-gradient(circle at 88% 15%, rgba(124,58,237,0.10), transparent 45%),
        radial-gradient(circle at 50% 100%, rgba(0,113,227,0.08), transparent 50%)
      `,
    }} />
    {/* Grain texture */}
    <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `url(${GRAIN_URL})`, opacity: 0.025, mixBlendMode: "multiply", pointerEvents: "none" }} />

    <style>{`
      @keyframes pulseGlow { 0%,100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.25); opacity: 0.9; } }
      @keyframes eqBar { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
    `}</style>

    {/* Logo */}
    <div style={{ marginBottom: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
      <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,113,227,0.35), transparent 70%)", filter: "blur(10px)", animation: "pulseGlow 3s ease-in-out infinite" }} />
        <div style={{ position: "relative", width: 64, height: 64, borderRadius: 18, background: "linear-gradient(145deg,#1d1d1f 0%,#3a3a3c 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
            <path d="M16 4 L16 28" stroke="white" strokeWidth="1" opacity="0.2"/>
            <path d="M4 16 L28 16" stroke="white" strokeWidth="1" opacity="0.2"/>
          </svg>
        </div>
      </div>
      <div style={{ textAlign: "center", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Soundprint</div>
      </div>
    </div>

    {/* Hero */}
    <div style={{ maxWidth: 580, textAlign: "center", marginBottom: 48, position: "relative", zIndex: 1 }}>
      <h1 style={{ fontSize: "clamp(36px,6vw,56px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--text)", marginBottom: 16, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Müziğin seni<br/>nasıl tanımlıyor?
      </h1>
      <p style={{ fontSize: 17, color: "var(--text2)", lineHeight: 1.7, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Dinleme verilerinden kişilik analizi, sanatçı ağı,<br/>
        haftalık pattern'lar ve yapay zeka yorumu.
      </p>
    </div>

    {/* CTA */}
    <div style={{ position: "relative", zIndex: 1, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
      <button onClick={authService.login} style={{ padding: "14px 32px", borderRadius: 980, background: "var(--accent)", border: "none", color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", boxShadow: "0 2px 12px rgba(0,113,227,0.35)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,113,227,0.45)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,113,227,0.35)"; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.42a.622.622 0 01-.857.208c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115.294.18.387.563.207.856zm1.243-2.765a.779.779 0 01-1.072.256c-2.687-1.652-6.785-2.13-9.965-1.166a.779.779 0 01-.974-.519.78.78 0 01.519-.975c3.632-1.102 8.147-.568 11.236 1.332a.779.779 0 01.256 1.072zm.107-2.88c-3.223-1.914-8.54-2.09-11.617-1.156a.935.935 0 01-.57-1.784c3.532-1.073 9.404-.866 13.115 1.338a.935.935 0 01-.928 1.602z"/></svg>
        Spotify ile Başla
      </button>
    </div>

    {/* Equalizer divider */}
    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", gap: 3, height: 20, marginTop: 36, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}>
      {EQ_BARS.map((h, i) => (
        <div key={i} style={{
          width: 3, height: `${h}%`, borderRadius: 2, background: "var(--accent)", opacity: 0.35,
          transformOrigin: "bottom", animation: `eqBar ${0.9 + (i % 4) * 0.15}s ease-in-out ${i * 0.06}s infinite`,
        }} />
      ))}
    </div>

    {/* Feature pills */}
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
      {["AI Kişilik Analizi","Sanatçı Ağı","DNA Görselleştirme","Dönem Karşılaştırma","Playlist Önerisi","Deep-Dive Sayfaları"].map(f => (
        <span key={f} style={{ padding: "6px 14px", borderRadius: 980, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 500, color: "var(--text2)", boxShadow: "var(--shadow)" }}>{f}</span>
      ))}
    </div>

    <div style={{ position: "relative", zIndex: 1, marginTop: 48, fontSize: 12, color: "var(--text3)", textAlign: "center", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
      Yalnızca okuma izinleri istenir · Veriler paylaşılmaz
    </div>
  </div>
);

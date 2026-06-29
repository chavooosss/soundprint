import { useEffect, useState } from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { authService } from "../services/api";
import { BpmChart } from "../components/BpmChart";
import { MoodScatterPlot } from "../components/MoodScatterPlot";
import { CharacterCard } from "../components/CharacterCard";
import { ArtistNetwork } from "../components/ArtistNetwork";
import { PatternHeatmap } from "../components/PatternHeatmap";
import { RecentFeed } from "../components/RecentFeed";
import { AIPersonality } from "../components/AIPersonality";
import { MusicDNA } from "../components/MusicDNA";
import { ComparisonMode } from "../components/ComparisonMode";
import { ArtistDeepDive } from "../components/ArtistDeepDive";
import { PlaylistEngine } from "../components/PlaylistEngine";
import { StatsCharts } from "../components/StatsCharts";
import type { SpotifyUser } from "../types";
import type { CharacterProfile } from "../types";

type Tab = "overview" | "ai" | "stats" | "network" | "artists" | "playlist" | "patterns" | "feed";
type TimeRange = "short_term" | "medium_term" | "long_term";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",      icon: "⊡" },
  { id: "ai",        label: "AI Analiz",     icon: "✦" },
  { id: "stats",     label: "İstatistikler", icon: "▦" },
  { id: "network",   label: "Sanatçı Ağı",  icon: "◎" },
  { id: "artists",   label: "Sanatçılar",   icon: "♪" },
  { id: "playlist",  label: "Playlist",     icon: "▷" },
  { id: "patterns",  label: "Patterns",     icon: "▣" },
  { id: "feed",      label: "Feed",         icon: "≡" },
];

export const Dashboard = () => {
  const { profile, loading, error, fetchProfile } = useAnalysis();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [fullData, setFullData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [timeRange] = useState<TimeRange>("medium_term");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark mode
  const [dark, setDark] = useState(() => localStorage.getItem("soundprint-theme") === "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("soundprint-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    authService.getStatus().then(({ data }) => setUser(data.user)).catch(() => { window.location.href = "/"; });
    fetchProfile().then((d) => { if (d) setFullData(d); });
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(0,113,227,0.15)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>Profil yükleniyor...</div>
    </div>
  );

  if (error || !profile) return (
    <div style={{ minHeight: "100vh", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--red)", fontSize: 13 }}>{error || "Profil yüklenemedi"}</div>
    </div>
  );

  const tracks = fullData?.topTracks?.[timeRange] ?? [];
  const artists = fullData?.topArtists?.[timeRange] ?? [];
  const allArtists = fullData?.topArtists?.medium_term ?? [];
  const recent = fullData?.recentlyPlayed ?? [];

  const buildPeriodProfile = (tr: TimeRange): { tracks: any[]; artists: any[]; profile: CharacterProfile } => {
    const t = fullData?.topTracks?.[tr] ?? [];
    const a = fullData?.topArtists?.[tr] ?? [];
    const p: CharacterProfile = { ...profile, stats: { ...profile.stats } };
    return { tracks: t, artists: a, profile: p };
  };

  const genreMap: Record<string, number> = {};
  allArtists.forEach((a: any) => { a.genres?.slice(0, 2).forEach((g: string) => { genreMap[g] = (genreMap[g] || 0) + 1; }); });
  const topGenres = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const navTo = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font)" }}>
      {/* Hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Menü">
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      <div className={`mobile-overlay${sidebarOpen ? " visible" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`dashboard-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo + dark toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(145deg,#1d1d1f,#3a3a3c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.9"><circle cx="12" cy="12" r="5" fill="white"/><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)", flex: 1 }}>Soundprint</span>
          <button className="theme-toggle" onClick={() => setDark((d) => !d)} title={dark ? "Açık tema" : "Koyu tema"}>
            {dark ? "☀" : "🌙"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => navTo(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "none", background: tab === t.id ? "var(--bg)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text2)", fontSize: 13, fontWeight: tab === t.id ? 600 : 500, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s", textAlign: "left" }}
              onMouseEnter={(e) => { if (tab !== t.id) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg)"; }}
              onMouseLeave={(e) => { if (tab !== t.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              <span style={{ fontSize: 14, opacity: 0.6, width: 18, textAlign: "center" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8 }}>
            {user?.images?.[0] ? <img src={user.images[0].url} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg)", flexShrink: 0 }} />}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.display_name}</div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>Spotify</div>
            </div>
          </div>
          <button onClick={() => authService.logout().then(() => { window.location.href = "/"; })}
            style={{ width: "100%", marginTop: 4, padding: "7px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text3)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"; }}>
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="dashboard-main">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="fade-up">
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
                Merhaba, {user?.display_name?.split(" ")[0]} 👋
              </h1>
              <div style={{ fontSize: 14, color: "var(--text2)" }}>İşte müzik profiliine genel bakış</div>
            </div>

            {/* Stats row */}
            <div className="stats-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { label: "Ort. Tempo", value: Math.round(profile.stats.avgTempo), unit: "BPM", color: "var(--accent)" },
                { label: "Enerji", value: (profile.stats.avgEnergy * 100).toFixed(0), unit: "%", color: "var(--green)" },
                { label: "Ruh Hali", value: (profile.stats.avgValence * 100).toFixed(0), unit: "%", color: "var(--purple)" },
                { label: "Top Parça", value: tracks.length, unit: "Şarkı", color: "var(--orange)" },
              ].map((s, i) => (
                <div key={i} className="card fade-up" style={{ padding: "18px 20px", animationDelay: `${i*0.05}s` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontWeight: 500 }}>{s.unit}</div>
                </div>
              ))}
            </div>

            <div className="content-grid-main" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="chart-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="card fade-up-2" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Tempo Akışı</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 14 }}>BPM dağılımı</div>
                    <BpmChart data={profile.stats.tempoOverTime} avgTempo={profile.stats.avgTempo} />
                  </div>
                  <div className="card fade-up-2" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Mood Matrisi</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 14 }}>Enerji × Ruh Hali</div>
                    <MoodScatterPlot data={profile.stats.moodGenreMatrix} />
                  </div>
                </div>

                <div className="card fade-up-3" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Top Parçalar</div>
                  </div>
                  {tracks.slice(0, 8).map((t: any, i: number) => (
                    <div key={t.id} className="track-item" style={{ padding: "9px 20px", borderBottom: i < 7 ? "1px solid var(--border2)" : "none", borderRadius: 0 }}>
                      <span style={{ fontSize: 11, color: "var(--text3)", width: 20, textAlign: "right", flexShrink: 0 }}>{i+1}</span>
                      <img src={t.album?.images?.[2]?.url||t.album?.images?.[0]?.url} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 1 }}>{t.artists?.map((a:any)=>a.name).join(", ")}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>
                        {t.duration_ms?`${Math.floor(t.duration_ms/60000)}:${String(Math.floor((t.duration_ms%60000)/1000)).padStart(2,"0")}`:""}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <CharacterCard profile={profile} />
                <div className="card fade-up-3" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Top Sanatçılar</div>
                  {artists.slice(0, 5).map((a: any, i: number) => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      {a.images?.[2] ? <img src={a.images[2].url} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{a.genres?.[0]??""}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>#{i+1}</span>
                    </div>
                  ))}
                </div>
                {topGenres.length > 0 && (
                  <div className="card fade-up-4" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Türler</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {topGenres.map(([g, c]) => (
                        <span key={g} style={{ padding: "4px 10px", borderRadius: 980, background: "var(--bg)", border: "1px solid var(--border)", fontSize: 11, fontWeight: 500, color: "var(--text2)" }}>{g} <span style={{ color: "var(--text3)" }}>{c}</span></span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "ai" && <div style={{ display:"flex", flexDirection:"column", gap:16 }}><MusicDNA profile={profile}/><AIPersonality profile={profile} topTracks={tracks} topArtists={allArtists}/></div>}
        {tab === "stats" && <StatsCharts shortProfile={buildPeriodProfile("short_term").profile} mediumProfile={buildPeriodProfile("medium_term").profile} longProfile={buildPeriodProfile("long_term").profile} tracks={tracks} artists={allArtists}/>}
        {tab === "network" && <ArtistNetwork artists={allArtists}/>}
        {tab === "artists" && <ArtistDeepDive artists={allArtists} tracks={[...fullData?.topTracks?.short_term??[], ...fullData?.topTracks?.medium_term??[], ...fullData?.topTracks?.long_term??[]]}/>}
        {tab === "playlist" && <PlaylistEngine tracks={[...fullData?.topTracks?.short_term??[], ...fullData?.topTracks?.medium_term??[], ...fullData?.topTracks?.long_term??[]]} artists={allArtists} profile={profile}/>}
        {tab === "patterns" && <div style={{ display:"flex", flexDirection:"column", gap:16 }}><PatternHeatmap recent={recent} tracks={tracks} profile={profile}/><ComparisonMode short={{ label:"4 Hafta",...buildPeriodProfile("short_term") }} medium={{ label:"6 Ay",...buildPeriodProfile("medium_term") }} long={{ label:"Tüm Zaman",...buildPeriodProfile("long_term") }}/></div>}
        {tab === "feed" && <RecentFeed recent={recent}/>}
      </div>
    </div>
  );
};

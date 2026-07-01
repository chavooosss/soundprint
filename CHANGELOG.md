# Changelog

## [0.2.0] — 2026-07-01

### Added
- **Haftalık Karşılaştırma** (`WeeklyComparison`) — son 7 gün vs önceki 7 gün dinleme karşılaştırması (Patterns sekmesi), veri 2 haftayı kapsamıyorsa şeffaf uyarı gösterir
- **Top parçalar hover card** (`TrackHoverCard`) — Overview'daki Top Parçalar listesinde hover'da albüm adı, çıkış tarihi ve süre gösteren React-portal tooltip
- **Paylaşılabilir profil kartı** (`ShareCard`) — yeni "Paylaş" sekmesi, 4 slayt (Karakter/Sanatçılar/Parçalar/Ses DNA), PNG indirme (html-to-image) ve Web Share API desteği
- Kart arkaplanında kişilik/archetype'a göre renklenen, imleçle etkileşen **WebGL fluid simulation** efekti (`webgl-fluid`)
- **PWA desteği**: manifest, service worker (Workbox runtime caching), offline fallback ekranı, kurulabilir ikon seti
- Login sayfası redesign: ambient mesh-gradient glow, pulse animasyonlu logo halo'su, equalizer bar dekorasyonu

### Fixed
- `ArtistDeepDive` içinde popülerlik verisi 0/eksik olduğunda "—" yerine takipçi sayısı gösteriliyor
- `PatternHeatmap` "Son Çalınanlar" listesindeki React duplicate-key uyarısı giderildi (`played_at` bazlı key)
- `npm run build` sırasında Node 18 webcrypto uyumsuzluğu nedeniyle oluşan çökme giderildi

## [0.1.0] — 2026-06-29

### Added
- Spotify OAuth2 flow with server-side CSRF state validation
- Automatic token refresh (60s pre-expiry) via Express middleware
- `/api/analysis/profile` — top tracks (3 time ranges) + top artists + recently played in one call
- Character archetype engine: Night Owl · Optimist · Deep Thinker · Flow State
- Audio stat estimation from track popularity + rank position (fallback for deprecated Audio Features API)
- `/api/analysis/ai-personality` — Gemini API proxy with model waterfall fallback
- **Dashboard** with 8 tabs: Overview, AI Analiz, İstatistikler, Sanatçı Ağı, Sanatçılar, Playlist, Patterns, Feed
- **MusicDNA** — animated canvas helix driven by 5 audio parameters
- **ArtistNetwork** — force-directed canvas graph (genre-based edges, artist photo nodes)
- **MoodScatterPlot** — valence × energy scatter with genre coloring
- **BpmChart**, **PatternHeatmap**, **ComparisonMode**, **StatsCharts**
- **AIPersonality** — Gemini personality analysis via backend proxy (no client-side key exposure)
- **PlaylistEngine**, **ArtistDeepDive**, **RecentFeed**, **CharacterCard**
- Apple-inspired design system (CSS variables, Inter font, `.card` / `.fade-up` utilities)

### Fixed
- OAuth state parameter now validated server-side (was present but unchecked — CSRF vulnerability)
- Gemini API key moved from `VITE_GEMINI_API_KEY` (exposed in bundle) to `backend/.env`
- `dangerouslySetInnerHTML` replaced with safe section parser + React rendering
- `querystring` npm package replaced with built-in `URLSearchParams`
- Missing `backend/tsconfig.json` added

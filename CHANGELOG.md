# Changelog

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

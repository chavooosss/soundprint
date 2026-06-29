# Soundprint

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Müziğin seni nasıl tanımlıyor?**

Spotify dinleme verilerinden kişilik analizi, sanatçı ilişki ağı, müzik DNA görselleştirmesi ve Gemini AI yorumu — tek bir arayüzde.

---

## Özellikler

| Sekme | Açıklama |
|---|---|
| **Overview** | Tempo/enerji/ruh hali kartları, BPM eğrisi, Mood matrisi, top parçalar ve sanatçılar |
| **AI Analiz** | Gemini ile müzik psikolojisi — Kişilik, Ruh Dünyası, Hayat Tarzı İpuçları |
| **İstatistikler** | 3 dönem karşılaştırmalı grafik (4 hafta / 6 ay / tüm zaman) |
| **Sanatçı Ağı** | Ortak türlere göre bağlantılı sanatçı grafiği — canvas fizik simülasyonu |
| **Sanatçılar** | Deep-dive sanatçı kartları: tür, takipçi, popülarite |
| **Playlist** | Karakter profiline göre çalışma playlist'i parametreleri |
| **Patterns** | Haftalık dinleme ısı haritası + dönem karşılaştırma |
| **Feed** | Son dinlenen şarkılar akışı |

**Müzik DNA** — 5 ses parametresi (enerji, ruh hali, tempo, dans, akustik) animasyonlu helix görselleştirmesi  
**Karakter Arketipleri** — Night Owl · Optimist · Deep Thinker · Flow State

---

## Mimari

```
soundprint/
├── backend/              # Node.js + Express + TypeScript
│   └── src/
│       ├── config/       # Env var yönetimi
│       ├── middleware/   # Auth + otomatik token yenileme
│       ├── routes/       # /auth + /api/analysis
│       ├── services/     # Spotify API client, analiz mantığı
│       └── types/        # Spotify veri tipleri
│
└── frontend/             # React 18 + TypeScript + Vite
    └── src/
        ├── components/   # 12 görsel bileşen
        ├── hooks/        # useAnalysis
        ├── pages/        # Login, Dashboard
        ├── services/     # API client
        └── types/        # CharacterProfile, AudioStats
```

Vite proxy ile frontend `/auth` ve `/api` isteklerini backend'e yönlendirir — ayrı origin'de cookie sorunu olmaz.

---

## Kurulum

### 1. Spotify App oluştur

[developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → **Create App**

Redirect URI: `http://127.0.0.1:3001/auth/callback`

### 2. Backend

```bash
cd backend
cp .env.example .env   # doldurun
npm install
npm run dev            # → http://127.0.0.1:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # → http://localhost:3000
```

### 4. Aç

`http://localhost:3000` → **Spotify ile Başla**

---

## Backend `.env`

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3001/auth/callback
SESSION_SECRET=<crypto.randomBytes(32).toString('hex')>
GEMINI_API_KEY=...      # Opsiyonel — AI Analiz sekmesi için
```

---

## Güvenlik Notları

- **OAuth CSRF koruması** — State parametresi server-side session'da saklanır ve callback'te doğrulanır
- **Token yenileme** — Middleware, token dolmadan 60 saniye önce otomatik refresh yapar
- **API key güvenliği** — Gemini key yalnızca backend `.env`'de tutulur, tarayıcıya asla ulaşmaz
- **Yalnızca okuma** — Sadece `user-top-read` ve `user-read-recently-played` scope'ları istenir
- **Veri paylaşımı yok** — Tüm veriler kullanıcı session'ında tutulur

---

## Roadmap

- [ ] Spotify Audio Features API ile gerçek BPM/energy/valence değerleri
- [ ] Playlist oluşturma ve Spotify'a kaydetme
- [ ] Dark mode
- [ ] Mobil responsive

---

## Lisans

MIT — [LICENSE](LICENSE)

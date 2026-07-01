import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Soundprint",
        short_name: "Soundprint",
        description: "Müziğin seni nasıl tanımlıyor?",
        lang: "tr",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#f5f5f7",
        theme_color: "#1d1d1f",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/auth/, /^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^\/auth\//,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^https:\/\/i\.scdn\.co\//,
            handler: "CacheFirst",
            options: {
              cacheName: "spotify-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:3001",
        changeOrigin: false,
        cookieDomainRewrite: "localhost",
      },
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: false,
        cookieDomainRewrite: "localhost",
      },
    },
  },
  preview: {
    port: 3000,
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:3001",
        changeOrigin: false,
        cookieDomainRewrite: "localhost",
      },
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: false,
        cookieDomainRewrite: "localhost",
      },
    },
  },
});

import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  port: parseInt(process.env.PORT || "3001"),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  sessionSecret: required("SESSION_SECRET"),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  spotify: {
    clientId: required("SPOTIFY_CLIENT_ID"),
    clientSecret: required("SPOTIFY_CLIENT_SECRET"),
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:3001/auth/callback",
    scopes: [
      "user-top-read",
      "user-read-recently-played",
      "user-read-private",
      "user-read-email",
    ].join(" "),
  },
} as const;

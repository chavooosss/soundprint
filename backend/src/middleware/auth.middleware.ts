import type { Request, Response, NextFunction } from "express";
import { refreshAccessToken } from "../services/spotify.service";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const tokens = req.session.spotifyTokens;
  if (!tokens) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const now = Date.now();
  const expiry = req.session.tokenExpiry ?? 0;

  // Refresh if token expires within 60 seconds
  if (now >= expiry - 60_000) {
    try {
      const refreshed = await refreshAccessToken(tokens.refresh_token);
      req.session.spotifyTokens = refreshed;
      req.session.tokenExpiry = now + refreshed.expires_in * 1000;
    } catch {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Token refresh failed" });
      return;
    }
  }

  next();
};

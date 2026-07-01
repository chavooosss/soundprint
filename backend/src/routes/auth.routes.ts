import { Router } from "express";
import crypto from "crypto";
import { config } from "../config";
import { exchangeCode, getAuthUrl, getMe } from "../services/spotify.service";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Session-independent state store: state → expiry timestamp
const pendingStates = new Map<string, number>();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

router.get("/login", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  pendingStates.set(state, Date.now() + STATE_TTL_MS);
  console.log("[Login] State:", state);
  res.redirect(getAuthUrl(state));
});

router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query as Record<string, string>;
  console.log("[Callback] Session ID:", req.sessionID);
  console.log("[Callback] Session state:", req.session.state);
  console.log("[Callback] Query state:", state);

  if (error) {
    res.redirect(`${config.clientUrl}?error=${encodeURIComponent(error)}`);
    return;
  }

  const stateExpiry = pendingStates.get(state);
  if (!state || !stateExpiry || Date.now() > stateExpiry) {
    res.redirect(`${config.clientUrl}?error=invalid_state`);
    return;
  }
  pendingStates.delete(state);

  try {
    const tokens = await exchangeCode(code);
    const user = await getMe(tokens.access_token);

    req.session.spotifyTokens = tokens;
    req.session.tokenExpiry = Date.now() + tokens.expires_in * 1000;
    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) {
        console.error("[Callback] Session save error:", err);
        res.redirect(`${config.clientUrl}?error=session_save_failed`);
        return;
      }
      console.log("[Callback] Success, user:", user.display_name, "| scopes:", tokens.scope);
      // Send session ID via URL so frontend can pass it back
      res.redirect(`${config.clientUrl}/dashboard?sid=${req.sessionID}`);
    });
  } catch (err) {
    console.error("[Auth Callback]", err);
    res.redirect(`${config.clientUrl}?error=auth_failed`);
  }
});

// Expose token for client-side Spotify API calls (only safe in local dev)
router.get("/token", requireAuth, (req, res) => {
  const tokens = req.session.spotifyTokens!;
  res.json({ access_token: tokens.access_token, userId: req.session.userId });
});

router.get("/status", requireAuth, async (req, res) => {
  try {
    const user = await getMe(req.session.spotifyTokens!.access_token);
    res.json({ authenticated: true, user });
  } catch {
    res.status(401).json({ authenticated: false });
  }
});

router.get("/status-by-sid/:sid", async (req, res) => {
  const { sid } = req.params;
  // Load session manually by ID
  req.sessionStore.get(sid, async (err, sessionData) => {
    if (err || !sessionData?.spotifyTokens) {
      res.status(401).json({ authenticated: false });
      return;
    }
    req.session.spotifyTokens = sessionData.spotifyTokens;
    req.session.tokenExpiry = sessionData.tokenExpiry;
    req.session.userId = sessionData.userId;
    req.session.save(() => {});
    try {
      const user = await getMe(sessionData.spotifyTokens.access_token);
      res.json({ authenticated: true, user });
    } catch {
      res.status(401).json({ authenticated: false });
    }
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("sid");
    res.json({ success: true });
  });
});

export default router;

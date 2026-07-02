import express from "express";
import session from "express-session";
import FileStore from "session-file-store";
import cors from "cors";
import path from "path";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import analysisRoutes from "./routes/analysis.routes";

const SessionFileStore = FileStore(session);

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: config.isProduction ? config.clientUrl : (origin, cb) => cb(null, true),
  credentials: true,
}));

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionFileStore({ path: "./sessions", ttl: 86400, reapInterval: 3600, logFn: () => {} }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
    },
  })
);

app.use("/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.get("/health", (_, res) => res.json({ status: "ok" }));

if (config.isProduction) {
  // Frontend + backend tek origin altında — cookie/CORS sorunlarından kaçınmanın en temiz yolu
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (_, res) => res.sendFile(path.join(frontendDist, "index.html")));
}

// Prod'da hosting platformları 0.0.0.0'ı bekler; dev'de callback ile aynı origin için 127.0.0.1
const host = config.isProduction ? "0.0.0.0" : "127.0.0.1";
app.listen(config.port, host, () => {
  console.log(`🎵 Backend running on http://${host}:${config.port}`);
});

export default app;

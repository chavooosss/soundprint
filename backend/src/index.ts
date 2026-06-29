import express from "express";
import session from "express-session";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import analysisRoutes from "./routes/analysis.routes";

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
    },
  })
);

app.use("/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.get("/health", (_, res) => res.json({ status: "ok" }));

// 127.0.0.1'de başlat — callback ile aynı origin
app.listen(config.port, "127.0.0.1", () => {
  console.log(`🎵 Backend running on http://127.0.0.1:${config.port}`);
});

export default app;

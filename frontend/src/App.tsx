import { useEffect, useState } from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import axios from "axios";

type Route = "login" | "dashboard" | "loading" | "offline";

export default function App() {
  const [route, setRoute] = useState<Route>("loading");

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("sid");
    const error = params.get("error");

    if (error) { setRoute("login"); return; }

    if (path === "/dashboard" && sid) {
      axios.get(`/auth/status-by-sid/${sid}`, { withCredentials: true })
        .then(() => {
          window.history.replaceState({}, "", "/dashboard");
          setRoute("dashboard");
        })
        .catch(() => setRoute(navigator.onLine ? "login" : "offline"));
      return;
    }

    if (path === "/dashboard") {
      axios.get("/auth/status", { withCredentials: true })
        .then(() => setRoute("dashboard"))
        .catch(() => setRoute(navigator.onLine ? "login" : "offline"));
      return;
    }

    setRoute("login");
  }, []);

  if (route === "loading") return (
    <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(29,185,84,0.2)", borderTopColor: "#1DB954", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (route === "offline") return (
    <div style={{ minHeight: "100vh", background: "#121212", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff", fontFamily: "Inter,sans-serif", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>📡</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Çevrimdışısın</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", maxWidth: 280 }}>İnternet bağlantın yok. Profilini görmek için tekrar bağlan ve dene.</div>
      <button onClick={() => window.location.reload()}
        style={{ marginTop: 8, padding: "10px 20px", borderRadius: 8, border: "none", background: "#1DB954", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
        Tekrar Dene
      </button>
    </div>
  );

  return route === "dashboard" ? <Dashboard /> : <Login />;
}

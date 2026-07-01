import { useEffect, useRef } from "react";
import type { CharacterProfile } from "../types";

interface Props { profile: CharacterProfile; isDark?: boolean; }

export const MusicDNA = ({ profile, isDark = false }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const W = canvas.parentElement!.clientWidth;
    const H = 220;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const { avgEnergy, avgValence, avgTempo, avgDanceability, avgAcousticness } = profile.stats;
    const params = [avgEnergy, avgValence, avgTempo / 200, avgDanceability, avgAcousticness];
    const colors = ["#0071e3", "#34c759", "#af52de", "#ff9f0a", "#ff2d55"];
    const labels = ["Enerji", "Ruh Hali", "Tempo", "Dans", "Akustik"];

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background — theme aware
      ctx.fillStyle = isDark ? "#1c1c1e" : "#f5f5f7";
      ctx.fillRect(0, 0, W, H);

      // Draw DNA strands
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 1) {
          const progress = x / W;
          const waveAmp = 28 + params[Math.floor(progress * 5)] * 20;
          const freq = 0.025 + avgTempo / 5000;
          const phase = s === 0 ? 0 : Math.PI;
          const y = H / 2 + Math.sin(x * freq + t + phase) * waveAmp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Draw rungs between strands
      const freq = 0.025 + avgTempo / 5000;
      for (let x = 20; x < W - 20; x += 28) {
        const waveAmp = 28 + params[Math.min(Math.floor((x/W) * 5), 4)] * 20;
        const y1 = H / 2 + Math.sin(x * freq + t) * waveAmp;
        const y2 = H / 2 + Math.sin(x * freq + t + Math.PI) * waveAmp;
        const paramIdx = Math.floor((x / W) * colors.length);
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = colors[Math.min(paramIdx, colors.length - 1)] + "55";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dot at intersection
        ctx.beginPath();
        ctx.arc(x, y1, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors[Math.min(paramIdx, colors.length - 1)];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Labels at bottom
      labels.forEach((label, i) => {
        const x = (i / (labels.length - 1)) * (W - 60) + 30;
        ctx.fillStyle = colors[i];
        ctx.font = "600 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, H - 12);
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
        ctx.font = "500 10px Inter, sans-serif";
        ctx.fillText((params[i] * 100).toFixed(0) + "%", x, H - 0);
      });

      t += 0.008;
      requestAnimationFrame(draw);
    };

    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [profile, isDark]);

  return (
    <div className="card" style={{ padding: "20px 20px 8px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 2 }}>Müzik DNA</div>
        <div style={{ fontSize: 12, color: "var(--text2)" }}>Ses profili — animasyonlu helix görselleştirme</div>
      </div>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", borderRadius: 10 }} />
    </div>
  );
};

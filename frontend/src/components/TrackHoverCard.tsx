import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

const formatReleaseDate = (date?: string) => {
  if (!date) return null;
  const parts = date.split("-");
  if (parts.length === 1) return parts[0];
  const month = MONTHS[parseInt(parts[1], 10) - 1];
  if (parts.length === 2) return `${month} ${parts[0]}`;
  return `${parseInt(parts[2], 10)} ${month} ${parts[0]}`;
};

const formatDuration = (ms?: number) =>
  ms ? `${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,"0")}` : null;

interface Props { track: any; index: number; showBorder: boolean; }

export const TopTrackRow = ({ track: t, index: i, showBorder }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const releaseDate = formatReleaseDate(t.album?.release_date);
  const duration = formatDuration(t.duration_ms);

  const width = 220;
  let style: React.CSSProperties = {};
  if (rect) {
    const spaceRight = window.innerWidth - rect.right;
    const left = spaceRight > width + 16 ? rect.right + 10 : Math.max(8, rect.left - width - 10);
    const top = Math.min(rect.top, window.innerHeight - 170);
    style = { position: "fixed", top, left, width };
  }

  return (
    <div ref={ref} className="track-item" style={{ padding: "9px 20px", borderBottom: showBorder ? "1px solid var(--border2)" : "none", borderRadius: 0 }}
      onMouseEnter={() => setRect(ref.current?.getBoundingClientRect() ?? null)}
      onMouseLeave={() => setRect(null)}>
      <span style={{ fontSize: 11, color: "var(--text3)", width: 20, textAlign: "right", flexShrink: 0 }}>{i+1}</span>
      <img src={t.album?.images?.[2]?.url||t.album?.images?.[0]?.url} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
        <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 1 }}>{t.artists?.map((a:any)=>a.name).join(", ")}</div>
      </div>
      <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>{duration}</span>

      {rect && createPortal(
        <div style={{ ...style, zIndex: 1000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-lg)", padding: 12, pointerEvents: "none" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <img src={t.album?.images?.[1]?.url||t.album?.images?.[0]?.url} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.album?.name}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border2)" }}>
            {releaseDate && (
              <div>
                <div style={{ fontSize: 9, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Çıkış</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{releaseDate}</div>
              </div>
            )}
            {duration && (
              <div>
                <div style={{ fontSize: 9, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Süre</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{duration}</div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

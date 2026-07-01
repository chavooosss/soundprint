import { useState } from "react";
interface Props { recent: any[]; }

export const RecentFeed = ({ recent }: Props) => {
  const [q, setQ] = useState("");
  const [n, setN] = useState(18);
  const seen = new Set<string>();
  const all = recent.filter((t:any)=>{
    if(seen.has(t.id))return false; seen.add(t.id);
    return !q||t.name?.toLowerCase().includes(q.toLowerCase())||t.artists?.[0]?.name?.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>Son Dinlenenler</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>{all.length} parça</div>
        </div>
        <div style={{ position: "relative" }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ara..." style={{ padding: "8px 14px 8px 36px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 12, fontFamily: "inherit", outline: "none", width: 200, transition: "border-color 0.15s" }} onFocus={e=>(e.target.style.borderColor="rgba(124,58,237,0.4)")} onBlur={e=>(e.target.style.borderColor="var(--border)")} />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 13, pointerEvents: "none" }}>⌕</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
        {all.slice(0,n).map((t:any,i:number)=>(
          <a key={`${t.id}-${i}`}
            href={t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`}
            target="_blank" rel="noreferrer"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", transition: "all 0.2s", cursor: "pointer", textDecoration: "none", display: "block" }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-3px)";el.style.borderColor="rgba(29,185,84,0.4)";el.style.boxShadow="0 12px 40px rgba(0,0,0,0.3)";}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="none";el.style.borderColor="var(--border)";el.style.boxShadow="none";}}>
            <div style={{ position: "relative" }}>
              <img src={t.album?.images?.[1]?.url||t.album?.images?.[0]?.url} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent,rgba(0,0,0,0.7))", pointerEvents: "none" }} />
              {t.duration_ms && <div style={{ position: "absolute", bottom: 8, right: 8, fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 4, backdropFilter: "blur(4px)" }}>{Math.floor(t.duration_ms/60000)}:{String(Math.floor((t.duration_ms%60000)/1000)).padStart(2,"0")}</div>}
            </div>
            <div style={{ padding: "10px 12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{t.artists?.map((a:any)=>a.name).join(", ")}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.album?.name}</div>
            </div>
          </a>
        ))}
      </div>

      {n < all.length && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={()=>setN(v=>v+18)}
            style={{ padding: "10px 28px", background: "transparent", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "rgba(167,139,250,0.8)", fontSize: 13, fontFamily: "inherit", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e=>{const b=e.currentTarget;b.style.background="rgba(124,58,237,0.1)";b.style.borderColor="rgba(124,58,237,0.5)";}}
            onMouseLeave={e=>{const b=e.currentTarget;b.style.background="transparent";b.style.borderColor="rgba(124,58,237,0.3)";}}>
            Daha Fazla Yükle <span style={{ opacity: 0.6, fontSize: 12 }}>({all.length-n} kaldı)</span>
          </button>
        </div>
      )}
    </div>
  );
};

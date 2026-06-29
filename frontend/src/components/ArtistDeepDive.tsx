import { useState } from "react";

interface Artist { id:string; name:string; genres:string[]; images?:{url:string}[]; popularity?:number; followers?:{total:number}; }
interface Props { artists: Artist[]; tracks: any[]; }

export const ArtistDeepDive = ({ artists, tracks }: Props) => {
  const [selected, setSelected] = useState<Artist | null>(null);

  const getArtistTracks = (artistId: string) =>
    tracks.filter((t:any) => t.artists?.some((a:any) => a.id === artistId));

  const art = selected ?? artists[0];
  if (!art) return null;

  const artTracks = getArtistTracks(art.id);
  const totalMs = artTracks.reduce((s:number,t:any) => s + (t.duration_ms??0), 0);
  const totalMin = Math.floor(totalMs / 60000);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
      {/* Artist list */}
      <div className="card" style={{ padding: 8, height: "fit-content", maxHeight: 520, overflow: "auto" }}>
        {artists.map(a => (
          <div key={a.id} onClick={() => setSelected(a)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer", background: (selected?.id ?? artists[0]?.id) === a.id ? "rgba(0,113,227,0.08)" : "transparent", transition: "background 0.15s" }}
            onMouseEnter={e => { if((selected?.id??artists[0]?.id)!==a.id)(e.currentTarget as HTMLElement).style.background="rgba(0,0,0,0.03)"; }}
            onMouseLeave={e => { if((selected?.id??artists[0]?.id)!==a.id)(e.currentTarget as HTMLElement).style.background="transparent"; }}>
            {a.images?.[2] ? <img src={a.images[2].url} style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
              : <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg)", flexShrink:0 }} />}
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:(selected?.id??artists[0]?.id)===a.id?"var(--accent)":"var(--text)" }}>{a.name}</div>
              <div style={{ fontSize:10, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.genres?.[0]??""}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Hero */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 140, background: `url(${art.images?.[0]?.url}) center/cover`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.7) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, padding: "16px 20px", display: "flex", alignItems: "flex-end", gap: 14 }}>
              <img src={art.images?.[1]?.url||art.images?.[0]?.url} style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(255,255,255,0.3)" }} />
              <div>
                <div style={{ fontSize:20, fontWeight:700, color:"#fff", letterSpacing:"-0.02em" }}>{art.name}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>{art.genres?.slice(0,3).join(" · ") ?? ""}</div>
              </div>
            </div>
          </div>
          <div style={{ padding:"14px 20px", display:"flex", gap:24 }}>
            {[
              { label:"Top Listemde", value:`${artTracks.length} parça` },
              { label:"Toplam Süre", value:totalMin>0?`${totalMin} dk`:"—" },
              { label:"Popülerlik", value:art.popularity?`${art.popularity}/100`:"—" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500, marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        {artTracks.length > 0 && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Top Listenizdeki Parçalar</div>
            {artTracks.map((t:any, i:number) => (
              <div key={t.id} className="track-item">
                <span style={{ fontSize:11, color:"var(--text3)", width:20, textAlign:"right", flexShrink:0 }}>{i+1}</span>
                <img src={t.album?.images?.[2]?.url||t.album?.images?.[0]?.url} style={{ width:34, height:34, borderRadius:6, objectFit:"cover" }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                  <div style={{ fontSize:11, color:"var(--text2)", marginTop:1 }}>{t.album?.name}</div>
                </div>
                <span style={{ fontSize:11, color:"var(--text3)", flexShrink:0 }}>
                  {t.duration_ms?`${Math.floor(t.duration_ms/60000)}:${String(Math.floor((t.duration_ms%60000)/1000)).padStart(2,"0")}`:""}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Genre tags */}
        {(art.genres?.length ?? 0) > 0 && (
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Türler</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {art.genres?.map(g => (
                <span key={g} style={{ padding:"5px 12px", borderRadius:980, background:"var(--bg)", border:"1px solid var(--border)", fontSize:12, fontWeight:500, color:"var(--text2)" }}>{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

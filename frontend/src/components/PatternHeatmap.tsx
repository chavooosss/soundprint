import type { CharacterProfile } from "../types";
interface Props { recent: any[]; tracks: any[]; profile: CharacterProfile; }
const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const HOURS=Array.from({length:24},(_,i)=>i);

const buildGrid=(recent:any[])=>{
  const g:number[][]=Array.from({length:7},()=>Array(24).fill(0));
  let hasData=false;
  recent.forEach((t:any)=>{if(t.played_at){hasData=true;const d=new Date(t.played_at);g[(d.getDay()+6)%7][d.getHours()]++;}});
  if(!hasData){[[5,22],[5,23],[6,0],[6,22],[4,21],[3,20],[6,23],[0,9],[1,10],[2,11],[3,9],[4,10]].forEach(([d,h])=>g[d][h]+=3);}
  return g;
};

export const PatternHeatmap = ({ recent, tracks, profile }: Props) => {
  const grid=buildGrid(recent);
  const max=Math.max(...grid.flat(),1);
  const color=(v:number)=>{
    if(v===0) return "rgba(255,255,255,0.03)";
    const t=v/max;
    return `rgba(${Math.round(124+t*(-124+59))},${Math.round(58+t*(130-58))},${Math.round(237+t*(246-237))},${0.2+t*0.8})`;
  };

  const genreMap:Record<string,number>={};
  (tracks.slice(0,30)).forEach((t:any)=>{t.artists?.[0]?.name&&(genreMap[t.artists[0].name]=(genreMap[t.artists[0].name]||0)+1);});
  const peakDay=grid.reduce((mi,r,i)=>r.reduce((s,v)=>s+v,0)>grid[mi].reduce((s,v)=>s+v,0)?i:mi,0);
  const peakHour=HOURS.reduce((mi,h)=>grid.reduce((s,r)=>s+r[h],0)>grid.reduce((s,r)=>s+r[mi],0)?h:mi,0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Peak Gün", value: DAYS[peakDay], sub: "en çok dinlenen", grad: "linear-gradient(135deg,#7c3aed,#4f46e5)" },
            { label: "Peak Saat", value: `${peakHour}:00`, sub: "en aktif saat", grad: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
            { label: "Son Dinlenen", value: `${recent.length}`, sub: "parça", grad: "linear-gradient(135deg,#10b981,#06b6d4)" },
          ].map(s=>(
            <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Haftalık Dinleme Haritası</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>Saat ve güne göre dinleme yoğunluğu</div>
          <div style={{ display: "grid", gridTemplateColumns: "28px repeat(24,1fr)", gap: 3, marginBottom: 4 }}>
            <div/>
            {HOURS.map(h=><div key={h} style={{ fontSize: 8, color: "var(--text3)", textAlign: "center", fontWeight: 500 }}>{h%6===0?`${h}h`:""}</div>)}
          </div>
          {DAYS.map((day,di)=>(
            <div key={day} style={{ display: "grid", gridTemplateColumns: "28px repeat(24,1fr)", gap: 3, marginBottom: 3 }}>
              <div style={{ fontSize: 10, color: "var(--text3)", display: "flex", alignItems: "center", fontWeight: 600 }}>{day}</div>
              {HOURS.map(h=>(
                <div key={h} title={`${day} ${h}:00`}
                  style={{ height: 16, borderRadius: 3, background: color(grid[di][h]), cursor: "default", transition: "transform 0.1s" }}
                  onMouseEnter={e=>{(e.target as HTMLElement).style.transform="scale(1.2)";(e.target as HTMLElement).style.outline="1px solid rgba(124,58,237,0.5)";}}
                  onMouseLeave={e=>{(e.target as HTMLElement).style.transform="none";(e.target as HTMLElement).style.outline="none";}}
                />
              ))}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>Az</span>
            {[0.1,0.3,0.5,0.7,0.9].map(v=><div key={v} style={{ width: 14, height: 14, borderRadius: 3, background: color(v*max) }}/>)}
            <span style={{ fontSize: 10, color: "var(--text3)" }}>Çok</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ses Profili</div>
          {[
            { label: "Enerji", val: profile.stats.avgEnergy, c: "#3b82f6" },
            { label: "Ruh Hali", val: profile.stats.avgValence, c: "#10b981" },
            { label: "Dans", val: profile.stats.avgDanceability, c: "#ec4899" },
            { label: "Akustik", val: profile.stats.avgAcousticness, c: "#f59e0b" },
            { label: "Enstrümantal", val: profile.stats.avgInstrumentalness, c: "#a855f7" },
          ].map(b=>(
            <div key={b.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: "var(--text2)", fontWeight: 500 }}>{b.label}</span>
                <span style={{ color: b.c, fontWeight: 700 }}>{(b.val*100).toFixed(1)}%</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${b.val*100}%`, background: b.c, borderRadius: 2, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Odaklanma Reçetesi</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{profile.archetype}</div>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7, marginBottom: 14 }}>{profile.description}</p>
          <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(167,139,250,0.7)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Hedef Parametreler</div>
            <div style={{ fontSize: 12, color: "rgba(240,240,245,0.6)", lineHeight: 1.8 }}>
              ~{Math.round(profile.studyPlaylistParams.targetTempo)} BPM<br/>
              {(profile.studyPlaylistParams.targetEnergy*100).toFixed(0)}% enerji<br/>
              {(profile.studyPlaylistParams.minInstrumentalness*100).toFixed(0)}%+ enstrümantal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

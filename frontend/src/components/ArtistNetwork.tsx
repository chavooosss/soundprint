import { useEffect, useRef, useState } from "react";

interface Artist { id: string; name: string; genres: string[]; images?: {url:string}[]; popularity?: number; }
interface Props { artists: Artist[]; }
interface Node { id:string; name:string; x:number; y:number; vx:number; vy:number; r:number; color:string; img?:string; genre:string; }
interface Edge { a:number; b:number; strength:number; }

const PAL = ["#7c3aed","#3b82f6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316","#a855f7"];
const gc = (g:string) => { let h=0; for(let i=0;i<g.length;i++) h=g.charCodeAt(i)+((h<<5)-h); return PAL[Math.abs(h)%PAL.length]; };

export const ArtistNetwork = ({ artists }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tip, setTip] = useState<{x:number;y:number;name:string;genre:string}|null>(null);
  const state = useRef<{nodes:Node[];edges:Edge[];raf:number;hi:number}>({nodes:[],edges:[],raf:0,hi:-1});

  useEffect(() => {
    if (!artists.length) return;
    const canvas = canvasRef.current!;
    const W = canvas.parentElement!.clientWidth;
    const H = 500;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    const top = artists.slice(0, 22);
    const nodes: Node[] = top.map((a, i) => {
      const ang = (i/top.length)*Math.PI*2;
      const d = 140 + Math.random()*80;
      return { id:a.id, name:a.name, x:W/2+Math.cos(ang)*d, y:H/2+Math.sin(ang)*d, vx:0, vy:0, r:7+(a.popularity??60)/18, color:gc(a.genres?.[0]??a.id), img:a.images?.[2]?.url||a.images?.[0]?.url, genre:a.genres?.[0]??"unknown" };
    });

    const edges: Edge[] = [];
    for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
      const shared = top[i].genres?.filter(g=>top[j].genres?.includes(g)).length??0;
      if (shared>0) edges.push({a:i,b:j,strength:shared});
    }

    const imgs: Record<string,HTMLImageElement> = {};
    nodes.forEach(n => { if(n.img){const im=new Image();im.crossOrigin="anonymous";im.src=n.img;imgs[n.id]=im;} });

    state.current.nodes=nodes; state.current.edges=edges;

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const {nodes:ns,edges:es,hi} = state.current;

      // Subtle bg
      ctx.fillStyle="#0f0f14";
      ctx.fillRect(0,0,W,H);

      // Grid dots
      ctx.fillStyle="rgba(255,255,255,0.025)";
      for(let x=0;x<W;x+=40) for(let y=0;y<H;y+=40) { ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill(); }

      // Edges
      es.forEach(e=>{
        const a=ns[e.a],b=ns[e.b];
        const isH=hi===e.a||hi===e.b;
        const grad=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        if(isH){grad.addColorStop(0,a.color+"88");grad.addColorStop(1,b.color+"88");}
        else{grad.addColorStop(0,"rgba(255,255,255,0.04)");grad.addColorStop(1,"rgba(255,255,255,0.04)");}
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=grad;ctx.lineWidth=isH?e.strength*0.8:0.5;ctx.stroke();
      });

      // Nodes
      ns.forEach((n,i)=>{
        const isH=hi===i;
        if(isH){
          const g=ctx.createRadialGradient(n.x,n.y,n.r,n.x,n.y,n.r*3.5);
          g.addColorStop(0,n.color+"35");g.addColorStop(1,"transparent");
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(n.x,n.y,n.r*3.5,0,Math.PI*2);ctx.fill();
        }
        ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.clip();
        const im=imgs[n.id];
        if(im?.complete&&im.naturalWidth>0){ctx.drawImage(im,n.x-n.r,n.y-n.r,n.r*2,n.r*2);}
        else{ctx.fillStyle=n.color+"44";ctx.fillRect(n.x-n.r,n.y-n.r,n.r*2,n.r*2);}
        ctx.restore();
        ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.strokeStyle=isH?n.color:n.color+"66";ctx.lineWidth=isH?2:1;ctx.stroke();
        if(isH){ctx.font="600 11px 'Plus Jakarta Sans',sans-serif";ctx.fillStyle="#fff";ctx.textAlign="center";ctx.shadowColor=n.color;ctx.shadowBlur=8;ctx.fillText(n.name,n.x,n.y+n.r+15);ctx.shadowBlur=0;}
      });

      // Physics
      ns.forEach((n,i)=>{
        ns.forEach((m,j)=>{if(i===j)return;const dx=n.x-m.x,dy=n.y-m.y;const d=Math.sqrt(dx*dx+dy*dy)||1;const f=900/(d*d);n.vx+=(dx/d)*f;n.vy+=(dy/d)*f;});
        n.vx+=(W/2-n.x)*0.0008;n.vy+=(H/2-n.y)*0.0008;
        n.vx*=0.88;n.vy*=0.88;n.x+=n.vx;n.y+=n.vy;
        n.x=Math.max(n.r+8,Math.min(W-n.r-8,n.x));n.y=Math.max(n.r+8,Math.min(H-n.r-8,n.y));
      });
      es.forEach(e=>{
        const a=ns[e.a],b=ns[e.b];
        const dx=b.x-a.x,dy=b.y-a.y;const d=Math.sqrt(dx*dx+dy*dy)||1;
        const t=90+(2-e.strength)*30,f=(d-t)*0.015,fx=(dx/d)*f,fy=(dy/d)*f;
        a.vx+=fx;a.vy+=fy;b.vx-=fx;b.vy-=fy;
      });

      state.current.raf=requestAnimationFrame(draw);
    };

    state.current.raf=requestAnimationFrame(draw);
    const onMove=(e:MouseEvent)=>{
      const r=canvas.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;
      let f=-1;
      state.current.nodes.forEach((n,i)=>{if(Math.sqrt((n.x-mx)**2+(n.y-my)**2)<n.r+6)f=i;});
      state.current.hi=f;
      if(f>=0){const n=state.current.nodes[f];setTip({x:mx,y:my,name:n.name,genre:n.genre});}else setTip(null);
    };
    canvas.addEventListener("mousemove",onMove);
    return()=>{cancelAnimationFrame(state.current.raf);canvas.removeEventListener("mousemove",onMove);};
  }, [artists]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Sanatçı İlişki Ağı</div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>Ortak türlere göre bağlantılı sanatçılar. Hover ile detay görün.</div>
      </div>
      <div style={{ position: "relative", background: "#0f0f14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
        {tip && (
          <div style={{ position: "absolute", left: tip.x+14, top: tip.y-10, background: "#161620", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", fontSize: 12, pointerEvents: "none", zIndex: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{tip.name}</div>
            <div style={{ color: "rgba(240,240,245,0.45)", fontSize: 11 }}>{tip.genre}</div>
          </div>
        )}
      </div>
    </div>
  );
};

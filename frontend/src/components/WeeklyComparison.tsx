interface Props { recent: any[]; }

const DAY = 86_400_000;

const bucketStats = (items: any[]) => {
  const artistCount = new Map<string, { name: string; count: number }>();
  const trackCount = new Map<string, { name: string; artist: string; count: number }>();

  items.forEach((t: any) => {
    t.artists?.forEach((a: any) => {
      const e = artistCount.get(a.id) ?? { name: a.name, count: 0 };
      e.count++;
      artistCount.set(a.id, e);
    });
    const e = trackCount.get(t.id) ?? { name: t.name, artist: t.artists?.[0]?.name ?? "", count: 0 };
    e.count++;
    trackCount.set(t.id, e);
  });

  const topArtist = [...artistCount.values()].sort((a, b) => b.count - a.count)[0] ?? null;
  const topTrack = [...trackCount.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    plays: items.length,
    uniqueTracks: trackCount.size,
    uniqueArtists: artistCount.size,
    topArtist,
    topTrack,
  };
};

const pctChange = (curr: number, prev: number): string | null => {
  if (prev === 0) return curr > 0 ? "yeni" : null;
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
};

export const WeeklyComparison = ({ recent }: Props) => {
  const withDates = recent.filter((t: any) => t.played_at);
  const now = Date.now();

  const thisWeek = withDates.filter((t: any) => now - new Date(t.played_at).getTime() <= 7 * DAY);
  const lastWeek = withDates.filter((t: any) => {
    const age = now - new Date(t.played_at).getTime();
    return age > 7 * DAY && age <= 14 * DAY;
  });

  const oldestPlay = withDates.reduce((min: number, t: any) => Math.min(min, new Date(t.played_at).getTime()), now);
  const coversTwoWeeks = now - oldestPlay >= 13 * DAY;

  const curr = bucketStats(thisWeek);
  const prev = bucketStats(lastWeek);

  const rows = [
    { label: "Dinleme", curr: curr.plays, prev: prev.plays },
    { label: "Farklı Parça", curr: curr.uniqueTracks, prev: prev.uniqueTracks },
    { label: "Farklı Sanatçı", curr: curr.uniqueArtists, prev: prev.uniqueArtists },
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Haftalık Karşılaştırma</div>
        <div style={{
          fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
          color: coversTwoWeeks ? "#34d399" : "#fb923c",
          background: coversTwoWeeks ? "rgba(52,211,153,.1)" : "rgba(251,146,60,.1)",
          border: `1px solid ${coversTwoWeeks ? "rgba(52,211,153,.25)" : "rgba(251,146,60,.25)"}`,
        }}>
          {coversTwoWeeks ? "✓ 2 haftalık veri" : "⚠ Sınırlı veri"}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16 }}>
        Son 7 gün vs önceki 7 gün · Spotify sadece son 50 çalmayı saklıyor
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
        {rows.map(r => (
          <div key={r.label} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{r.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{r.curr}</span>
              {pctChange(r.curr, r.prev) && (
                <span style={{ fontSize: 11, fontWeight: 600, color: r.curr >= r.prev ? "#34c759" : "#ff3b30" }}>
                  {pctChange(r.curr, r.prev)}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>önceki: {r.prev}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>Bu Hafta Zirvesi</div>
          {curr.topArtist ? (
            <div style={{ fontSize: 12, color: "var(--text2)" }}>
              🎤 <b>{curr.topArtist.name}</b> ({curr.topArtist.count}x) &nbsp;·&nbsp;
              🎵 <b>{curr.topTrack?.name}</b> ({curr.topTrack?.count}x)
            </div>
          ) : <div style={{ fontSize: 12, color: "var(--text3)" }}>Veri yok</div>}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 8 }}>Geçen Hafta Zirvesi</div>
          {prev.topArtist ? (
            <div style={{ fontSize: 12, color: "var(--text2)" }}>
              🎤 <b>{prev.topArtist.name}</b> ({prev.topArtist.count}x) &nbsp;·&nbsp;
              🎵 <b>{prev.topTrack?.name}</b> ({prev.topTrack?.count}x)
            </div>
          ) : <div style={{ fontSize: 12, color: "var(--text3)" }}>Geçen hafta için veri yok</div>}
        </div>
      </div>
    </div>
  );
};

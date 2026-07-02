export const LogoMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="soundprintGradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="4" stroke="url(#soundprintGradient)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="17 8" transform="rotate(-15 16 16)" />
    <circle cx="16" cy="16" r="8" stroke="url(#soundprintGradient)" strokeWidth="2" strokeLinecap="round" strokeDasharray="33 17" transform="rotate(35 16 16)" opacity="0.85" />
    <circle cx="16" cy="16" r="12" stroke="url(#soundprintGradient)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="50 25" transform="rotate(-100 16 16)" opacity="0.6" />
    <circle cx="16" cy="16" r="1.8" fill="url(#soundprintGradient)" />
  </svg>
);

export const LogoIcon = ({ size = 64, radius = 18 }: { size?: number; radius?: number }) => (
  <div style={{ width: size, height: size, borderRadius: radius, background: "linear-gradient(145deg,#1d1d1f 0%,#3a3a3c 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <LogoMark size={Math.round(size * 0.5)} />
  </div>
);

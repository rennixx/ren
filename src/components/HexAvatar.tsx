export default function HexAvatar() {
  return (
    <div className="relative w-[72px] h-[72px] mx-auto mb-3.5">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        className="absolute inset-0"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.3))" }}
        aria-hidden="true"
      >
        <polygon
          points="36,4 66,22 66,50 36,68 6,50 6,22"
          fill="rgba(0,229,255,0.05)"
          stroke="#00e5ff"
          strokeWidth="1"
        />
        <polygon
          points="36,14 56,26 56,46 36,58 16,46 16,26"
          fill="none"
          stroke="rgba(0,229,255,0.3)"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl text-accent">?</span>
      </div>
    </div>
  );
}
export default function TopNav() {
  return (
    <nav
      className="relative z-10 flex items-center justify-between px-5 py-2"
      style={{
        borderBottom: "1px solid rgba(0,229,255,0.2)",
        background:
          "linear-gradient(180deg, rgba(0,229,255,0.05), transparent)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          aria-hidden="true"
        >
          <polygon
            points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.5"
          />
          <polygon
            points="10,5 14,7.5 14,12.5 10,15 6,12.5 6,7.5"
            fill="rgba(0,229,255,0.1)"
            stroke="#00e5ff"
            strokeWidth="0.5"
          />
        </svg>
        <span className="text-xs font-bold tracking-[4px] uppercase text-accent">
          REN://
        </span>
      </div>

      <div className="flex gap-5 text-[9px] tracking-[2px] uppercase">
        <button className="text-accent border-b pb-0.5 border-accent/40 cursor-pointer">
          Dashboard
        </button>
        <button className="text-accent/40 cursor-pointer hover:text-accent/70 transition-colors">
          Projects
        </button>
        <button className="text-accent/40 cursor-pointer hover:text-accent/70 transition-colors">
          Contact
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_#00e5ff] animate-pulse" />
        <span className="text-[9px] text-accent/80 tracking-wider">
          SYS::ONLINE
        </span>
      </div>
    </nav>
  );
}
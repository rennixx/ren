import TopNav from "@/components/TopNav";
import ProfilePanel from "@/components/ProfilePanel";
import HeroDisplay from "@/components/HeroDisplay";
import ProjectGrid from "@/components/ProjectGrid";
import StatsPanel from "@/components/StatsPanel";
import CircuitConnector from "@/components/CircuitConnector";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-base relative">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.03) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <TopNav />

      <div className="relative z-[1] grid grid-cols-[260px_1fr_200px] grid-rows-2 gap-2.5 p-3.5 px-[18px] h-[calc(100vh-38px)]">
        {/* Circuit connectors */}
        <CircuitConnector
          direction="horizontal"
          className="top-1/2 left-[262px]"
        />
        <CircuitConnector
          direction="horizontal"
          className="top-[35%] right-[208px]"
        />
        <CircuitConnector
          direction="vertical"
          className="top-1/2 left-1/2 -translate-x-1/2"
        />

        {/* Left: Profile (spans both rows) */}
        <section className="row-span-2" aria-label="Profile">
          <ProfilePanel />
        </section>

        {/* Center top: Hero */}
        <section aria-label="Hero">
          <HeroDisplay />
        </section>

        {/* Right: Stats (spans both rows) */}
        <aside className="row-span-2" aria-label="System Stats">
          <StatsPanel />
        </aside>

        {/* Center bottom: Projects */}
        <section aria-label="Projects">
          <ProjectGrid />
        </section>
      </div>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import TopNav from "@/components/TopNav";
import ProfilePanel from "@/components/ProfilePanel";
import HeroDisplay from "@/components/HeroDisplay";
import ProjectGrid from "@/components/ProjectGrid";
import StatsPanel from "@/components/StatsPanel";
import CircuitConnector from "@/components/CircuitConnector";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

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

      <motion.div className="relative z-[1] grid grid-cols-1 md:grid-cols-[1fr_240px] lg:grid-cols-[300px_1fr_240px] md:grid-rows-[auto_1fr_1fr] lg:grid-rows-2 gap-2.5 p-3.5 px-[18px] h-[calc(100vh-44px)] overflow-auto lg:overflow-hidden" variants={containerVariants} initial="hidden" animate="visible">
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
        <motion.section id="contact" className="row-span-2" aria-label="Profile" variants={panelVariants}>
          <ProfilePanel />
        </motion.section>

        {/* Center top: Hero */}
        <motion.section id="dashboard" aria-label="Hero" variants={panelVariants}>
          <HeroDisplay />
        </motion.section>

        {/* Right: Stats (spans both rows) */}
        <motion.aside className="row-span-2" aria-label="System Stats" variants={panelVariants}>
          <StatsPanel />
        </motion.aside>

        {/* Center bottom: Projects */}
        <motion.section id="projects" aria-label="Projects" variants={panelVariants}>
          <ProjectGrid />
        </motion.section>
      </motion.div>
    </main>
  );
}

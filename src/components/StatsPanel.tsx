"use client";

import { useEffect, useState } from "react";
import profileData from "@/data/profile.json";

function useCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(eased * target);
      setCount(current);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

export default function StatsPanel() {
  const { stats, skills } = profileData;
  const [repoCount, setRepoCount] = useState(stats.projectCount);
  const stackCount = useCounter(stats.stackCount);

  useEffect(() => {
    fetch("https://api.github.com/users/rennixx")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.public_repos === "number") {
          setRepoCount(data.public_repos);
        }
      })
      .catch(() => {});
  }, []);

  const projectCount = useCounter(repoCount);
  const projectHex = "0x" + projectCount.toString(16).toUpperCase().padStart(2, "0");

  return (
    <div className="panel-clip panel-border h-full p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-accent/70 tracking-[2px] uppercase">
          {"SYSTEM.INFO"}
        </span>
        <span className="text-[10px] text-accent/50">0xF2A1</span>
      </div>

      {/* Status */}
      <div className="stat-box">
        <div className="text-[11px] text-accent/60 tracking-[1px] uppercase mb-1.5">
          Status
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 items-end">
            <div className="w-[3px] h-1.5 bg-accent shadow-[0_0_3px_#00e5ff]" />
            <div className="w-[3px] h-2.5 bg-accent shadow-[0_0_3px_#00e5ff]" />
            <div className="w-[3px] h-3.5 bg-accent shadow-[0_0_3px_#00e5ff]" />
            <div className="w-[3px] h-[18px] bg-accent shadow-[0_0_3px_#00e5ff]" />
          </div>
          <div>
            <div className="text-sm text-accent font-bold">ONLINE</div>
            <div className="text-[11px] text-text-tertiary">
              {stats.statusText}
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="stat-box">
        <div className="text-[11px] text-accent/60 tracking-[1px] uppercase mb-1.5">
          Projects
        </div>
        <div className="text-3xl text-accent font-bold font-mono">
          {projectHex}
        </div>
        <div className="text-xs text-text-tertiary mt-0.5">
          {projectCount} repositories
        </div>
        <div className="flex gap-0.5 items-end mt-1.5 h-4">
          <div className="w-1.5 bg-accent/40" style={{ height: "40%" }} />
          <div className="w-1.5 bg-accent/50" style={{ height: "60%" }} />
          <div className="w-1.5 bg-accent/60" style={{ height: "80%" }} />
          <div
            className="w-1.5 bg-accent shadow-[0_0_4px_rgba(0,229,255,0.3)]"
            style={{ height: "100%" }}
          />
          <div className="w-1.5 bg-accent/50" style={{ height: "70%" }} />
          <div className="w-1.5 bg-accent/40" style={{ height: "50%" }} />
        </div>
      </div>

      {/* Experience */}
      <div className="stat-box">
        <div className="text-[11px] text-accent/60 tracking-[1px] uppercase mb-1.5">
          Experience
        </div>
        <div className="text-[28px] text-accent font-bold">
          {stats.experience}
          <span className="text-sm text-text-tertiary">+ </span>
          <span className="text-[13px] text-text-tertiary">
            {stats.experienceUnit}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="rgba(0,229,255,0.15)"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              strokeDasharray="42 57"
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          </svg>
          <span className="text-xs text-text-tertiary">
            Seniority: {stats.seniorityPercent}%
          </span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="stat-box">
        <div className="text-[11px] text-accent/60 tracking-[1px] uppercase mb-1.5">
          Tech Stack
        </div>
        <div className="text-[28px] text-accent font-bold">
          {stackCount}
          <span className="text-sm text-text-tertiary">+ </span>
          <span className="text-[13px] text-text-tertiary">tools</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {skills.slice(0, 3).map((s) => (
            <span
              key={s.name}
              className="text-[10px] text-accent/70 px-1.5 py-0.5 border border-accent/20"
            >
              {s.name}
            </span>
          ))}
          <span className="text-[10px] text-accent/70 px-1.5 py-0.5 border border-accent/20">
            +{stackCount - 3}
          </span>
        </div>
      </div>

      {/* Uptime */}
      <div className="stat-box">
        <div className="text-[11px] text-accent/60 tracking-[1px] uppercase mb-1">
          Uptime
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base text-accent font-mono font-bold">
            {stats.uptime}
          </span>
          <div className="flex gap-px uptime-shimmer">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[3px] h-2 bg-accent"
              />
            ))}
            <div className="w-[3px] h-2 bg-accent/30" />
          </div>
        </div>
      </div>

      <div className="mt-auto text-center text-[10px] text-accent/30 tracking-wider">
        v1.0.0 // 2026
      </div>
    </div>
  );
}

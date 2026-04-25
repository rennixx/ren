"use client";

import { motion } from "framer-motion";
import HexAvatar from "./HexAvatar";
import profileData from "@/data/profile.json";

export default function ProfilePanel() {
  const { name, title, bio, skills, contact } = profileData;

  const contactLabels: Record<string, string> = {
    github: "GH",
    linkedin: "LI",
    email: "EM",
    twitter: "TW",
  };

  return (
    <div className="panel-clip panel-border h-full p-5 flex flex-col">
      <div className="flex justify-between items-center mb-3.5">
        <span className="text-[11px] text-accent/60 tracking-[2px] uppercase">
          {"// User.Profile"}
        </span>
        <span className="text-[10px] text-accent/50 font-mono">0x7A3F</span>
      </div>

      <HexAvatar />

      <div className="text-center mb-1">
        <div className="text-lg font-bold text-text-primary tracking-wider">
          {name}
        </div>
        <div className="text-xs text-accent tracking-[2px] uppercase mt-1">
          {title}
        </div>
      </div>

      <div className="circuit-separator my-3.5">
        <div className="circuit-dot" />
      </div>

      <p className="text-[13px] text-text-secondary leading-relaxed text-center mb-3.5">
        {bio}
      </p>

      <div className="text-[11px] text-accent/60 tracking-[2px] uppercase mb-2">
        {"// Tech Stack"}
      </div>

      <div className="flex flex-col gap-1.5">
        {skills.map((skill, i) => (
          <div key={skill.name}>
            <div className="flex justify-between text-xs text-text-secondary mb-0.5">
              <span>{skill.name}</span>
              <span className="text-accent">{skill.level}%</span>
            </div>
            <div className="skill-bar-track">
              <motion.div
                className="skill-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="circuit-separator mb-2">
          <div className="circuit-dot" />
        </div>
        <div className="flex justify-center gap-1.5">
          {Object.entries(contact).map(([key, url]) => (
            <motion.a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-accent/35 flex items-center justify-center text-[11px] text-accent icon-clip hover:bg-accent/10 transition-colors"
              aria-label={key}
              whileHover={{ scale: 1.1, borderColor: "rgba(0,229,255,0.6)" }}
              transition={{ duration: 0.15 }}
            >
              {contactLabels[key] ?? key.slice(0, 2).toUpperCase()}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

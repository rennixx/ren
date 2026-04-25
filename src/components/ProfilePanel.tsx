"use client";

import { motion } from "framer-motion";
import HexAvatar from "./HexAvatar";
import profileData from "@/data/profile.json";

export default function ProfilePanel() {
  const { name, title, bio, skills, contact } = profileData;

  const contactIcons: Record<string, React.ReactNode> = {
    github: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    linkedin: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    email: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
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
                transition={{ duration: 1.0, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {contactIcons[key] ?? key.slice(0, 2).toUpperCase()}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export default function ProjectCard({
  id,
  name,
  description,
  tags,
}: ProjectCardProps) {
  return (
    <motion.div
      className="card-clip border border-accent/15 p-2.5 relative bg-accent/[0.01] cursor-pointer group"
      whileHover={{ y: -2, borderColor: "rgba(0,229,255,0.3)", backgroundColor: "rgba(0,229,255,0.04)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm text-text-primary font-bold group-hover:text-accent transition-colors">
          {name}
        </div>
        <div className="text-[10px] text-accent/60 font-mono">#{id}</div>
      </div>
      <div className="text-xs text-text-tertiary mb-1.5 leading-relaxed">
        {description}
      </div>
      <div className="flex gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-accent/70 px-[6px] py-0.5 border border-accent/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

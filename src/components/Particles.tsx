"use client";

import { useMemo } from "react";

const PARTICLES = [
  { size: 2.8, left: 14, top: 22, opacity: 0.12, duration: 18, delay: -3 },
  { size: 1.8, left: 67, top: 8, opacity: 0.18, duration: 22, delay: -12 },
  { size: 2.2, left: 43, top: 71, opacity: 0.09, duration: 26, delay: -7 },
  { size: 3.0, left: 88, top: 45, opacity: 0.14, duration: 19, delay: -18 },
  { size: 1.5, left: 5, top: 89, opacity: 0.2, duration: 28, delay: -1 },
  { size: 2.5, left: 31, top: 34, opacity: 0.11, duration: 24, delay: -15 },
  { size: 1.9, left: 76, top: 62, opacity: 0.16, duration: 17, delay: -9 },
  { size: 2.1, left: 52, top: 17, opacity: 0.08, duration: 30, delay: -5 },
  { size: 2.7, left: 19, top: 56, opacity: 0.13, duration: 21, delay: -20 },
  { size: 1.6, left: 93, top: 28, opacity: 0.19, duration: 25, delay: -11 },
  { size: 2.3, left: 38, top: 83, opacity: 0.1, duration: 20, delay: -8 },
  { size: 3.2, left: 61, top: 5, opacity: 0.15, duration: 27, delay: -14 },
  { size: 1.7, left: 8, top: 47, opacity: 0.17, duration: 23, delay: -2 },
  { size: 2.4, left: 84, top: 73, opacity: 0.09, duration: 29, delay: -16 },
  { size: 2.0, left: 26, top: 95, opacity: 0.22, duration: 16, delay: -6 },
  { size: 2.9, left: 57, top: 39, opacity: 0.11, duration: 18, delay: -19 },
  { size: 1.8, left: 72, top: 11, opacity: 0.14, duration: 26, delay: -13 },
  { size: 2.6, left: 47, top: 68, opacity: 0.08, duration: 22, delay: -4 },
];

export default function Particles() {
  const particles = useMemo(() =>
    PARTICLES.map((p, i) => ({
      id: i,
      size: p.size,
      left: `${p.left}%`,
      top: `${p.top}%`,
      opacity: p.opacity,
      duration: p.duration,
      delay: p.delay,
    }))
  , []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-accent"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

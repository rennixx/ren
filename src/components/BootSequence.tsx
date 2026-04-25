"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

const STATUS_MESSAGES = [
  "INITIALIZING",
  "LOADING MODULES",
  "COMPILING",
  "ALMOST READY",
  "SYSTEM STARTED",
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [phase, setPhase] = useState<"progress" | "glitch" | "reveal">("progress");
  const overlayControls = useAnimation();

  const triggerComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "progress") return;

    const statusTimings = [0, 700, 1400, 2100, 2800];
    statusTimings.forEach((delay, i) => {
      setTimeout(() => setStatusIndex(i), delay);
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        const remaining = 100 - prev;
        const increment = remaining * 0.08 + 1;
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 250);

    const finishTimer = setTimeout(() => {
      setProgress(100);
      setStatusIndex(4);
    }, 3200);

    const glitchTimer = setTimeout(() => {
      setPhase("glitch");
    }, 3400);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
      clearTimeout(glitchTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "glitch") return;

    const revealTimer = setTimeout(() => {
      setPhase("reveal");
    }, 600);

    return () => clearTimeout(revealTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "reveal") return;

    overlayControls.start({ opacity: 0, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } });
    const completeTimer = setTimeout(triggerComplete, 1100);
    return () => clearTimeout(completeTimer);
  }, [phase, overlayControls, triggerComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-base flex flex-col items-center justify-center"
      animate={overlayControls}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Progress bar */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-48 h-[2px] bg-accent/10 rounded-[1px] mb-3">
          <motion.div
            className="h-full bg-accent rounded-[1px]"
            style={{ boxShadow: "0 0 8px #00e5ff" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="text-[9px] tracking-[3px] uppercase text-accent/50">
          {STATUS_MESSAGES[statusIndex]}
        </div>
      </div>

      {/* Glitch effect */}
      {phase === "glitch" && (
        <>
          <div
            className="absolute inset-0 z-20"
            style={{
              background: "#00e5ff",
              opacity: 0.25,
            }}
          />
          <div
            className="absolute left-0 right-0 z-20"
            style={{
              top: "30%",
              height: "2px",
              background: "#00e5ff",
              boxShadow: "0 0 20px #00e5ff",
              animation: "glitch-sweep 0.4s ease-out forwards",
            }}
          />
          <div
            className="absolute left-0 right-0 z-20"
            style={{
              top: "65%",
              height: "1px",
              background: "#00e5ff",
              boxShadow: "0 0 12px #00e5ff",
              animation: "glitch-sweep 0.3s 0.1s ease-out forwards",
            }}
          />
        </>
      )}
    </motion.div>
  );
}

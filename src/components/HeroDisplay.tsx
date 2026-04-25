"use client";

import { useState, useEffect } from "react";
import profileData from "@/data/profile.json";

export default function HeroDisplay() {
  const { name, title } = profileData;
  const nameText = name.toUpperCase();
  const subtitleText = `${title} crafting modern web experiences with clean code.`;

  const [typedName, setTypedName] = useState("");
  const [typedSub, setTypedSub] = useState("");
  const [nameDone, setNameDone] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < nameText.length) {
        setTypedName(nameText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setNameDone(true);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [nameText]);

  useEffect(() => {
    if (!nameDone) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < subtitleText.length) {
        setTypedSub(subtitleText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [nameDone, subtitleText]);

  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="relative flex items-center justify-center h-full">
      <div className="panel-clip panel-border w-full h-full p-6 flex flex-col justify-center items-center relative">
        {/* Corner circuits */}
        <div className="absolute top-3 left-3 w-[30px] h-[30px]">
          <div className="absolute top-0 left-0 w-5 h-px bg-accent/50" />
          <div className="absolute top-0 left-0 w-px h-5 bg-accent/50" />
          <div className="absolute top-1 left-1 w-[3px] h-[3px] border border-accent/50" />
        </div>
        <div className="absolute top-3 right-3 w-[30px] h-[30px]">
          <div className="absolute top-0 right-0 w-5 h-px bg-accent/50" />
          <div className="absolute top-0 right-0 w-px h-5 bg-accent/50" />
        </div>
        <div className="absolute bottom-3 left-3 w-[30px] h-[30px]">
          <div className="absolute bottom-0 left-0 w-5 h-px bg-accent/50" />
          <div className="absolute bottom-0 left-0 w-px h-5 bg-accent/50" />
        </div>
        <div className="absolute bottom-3 right-3 w-[30px] h-[30px]">
          <div className="absolute bottom-0 right-0 w-5 h-px bg-accent/50" />
          <div className="absolute bottom-0 right-0 w-px h-5 bg-accent/50" />
        </div>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] text-accent/60 tracking-[2px] uppercase">
          {"// Main.Display"}
        </div>

        {/* Rotating rings */}
        <div className="relative w-40 h-40 mb-3 flex items-center justify-center">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="absolute animate-spin-slow opacity-20"
            aria-hidden="true"
          >
            <circle
              cx="80"
              cy="80"
              r="75"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="0.5"
              strokeDasharray="8,4"
            />
            <circle
              cx="80"
              cy="80"
              r="65"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="0.3"
              strokeDasharray="4,8"
            />
          </svg>
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="absolute animate-spin-slow-reverse opacity-[0.12]"
            aria-hidden="true"
          >
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="0.5"
              strokeDasharray="12,6"
            />
          </svg>
          <div className="relative z-10 text-center">
            <div className="text-[13px] text-accent tracking-[4px] uppercase mb-1">
              Welcome to
            </div>
            <div className="text-[36px] font-bold text-text-primary tracking-[2px]">
              {typedName}
              <span
                className="text-accent"
                style={{ opacity: cursorVisible ? 1 : 0 }}
              >
                _
              </span>
            </div>
          </div>
        </div>

        <div
          className="h-px w-20 mb-2"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00e5ff, transparent)",
          }}
        />
        <p className="text-[14px] text-text-secondary text-center max-w-[300px] leading-relaxed mb-3.5 h-[42px]">
          {typedSub}
        </p>
      </div>
    </div>
  );
}

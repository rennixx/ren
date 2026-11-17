"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CommitTag, LogEntry } from "@/data/log";
import { commits } from "@/data/log";
import { GraphRail } from "@/components/GraphRail";
import { Prompt } from "@/components/Prompt";

const rowGrid =
  "grid grid-cols-[7.5ch_3.6rem_minmax(0,1fr)_auto] items-start gap-x-3";

const tagClass: Record<CommitTag, string> = {
  proto: "border-line text-muted",
  MIT: "border-gold/50 text-gold",
  live: "border-mint/60 text-mint",
};

function CommitRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
      <GraphRail kind={entry.graph} />
      <div className="min-w-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className={`${rowGrid} w-full cursor-pointer py-4 text-left`}
        >
          <span
            className={`text-[13px] leading-6 ${open ? "text-gold" : "text-muted"}`}
          >
            {entry.hash}
          </span>
          <span className="pt-px">
            {entry.tag ? (
              <span
                className={`inline-flex rounded-full border px-2 py-px text-[11px] leading-5 ${tagClass[entry.tag]}`}
              >
                {entry.tag}
              </span>
            ) : null}
          </span>
          <span className="min-w-0 whitespace-nowrap text-[13.5px] leading-6 text-ink">
            {entry.message}
          </span>
          <span className="whitespace-nowrap text-right text-[12.5px] leading-6 text-muted">
            {entry.stack}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              role="region"
              aria-label={entry.message}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className={`${rowGrid} pb-4`}>
                <div className="col-start-3 col-span-2 max-w-[66ch]">
                  <p className="text-[13.5px] leading-6 text-muted">{entry.description}</p>
                  {entry.install ? (
                    <p className="mt-3 text-[13.5px] leading-6 text-ink">
                      <span className="text-muted">$ </span>
                      {entry.install}
                    </p>
                  ) : null}
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-[13.5px] leading-6 text-ink underline decoration-line underline-offset-4 hover:text-gold hover:decoration-gold"
                    >
                      {entry.hrefLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
}

export function CommitGraph() {
  return (
    <section className="mt-24" aria-labelledby="log-heading">
      <h2 id="log-heading" className="font-normal">
        <Prompt command="git log --graph" />
      </h2>
      <ol className="mt-8 list-none p-0">
        {commits.map((entry) => (
          <CommitRow key={entry.id} entry={entry} />
        ))}
      </ol>
    </section>
  );
}

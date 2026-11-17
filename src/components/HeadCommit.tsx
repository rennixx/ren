import { headCommit } from "@/data/log";
import { Prompt } from "@/components/Prompt";

export function HeadCommit() {
  return (
    <header>
      <p>
        <Prompt command="git show HEAD" />
      </p>
      <p className="mt-8 text-[13px] leading-6 text-muted">
        commit <span className="text-gold">{headCommit.hash}</span>
        {"  (HEAD -> main, tag: open-to-work)"}
      </p>
      <p className="text-[13px] leading-6 text-muted">{"Author: ren <ren@icyren.dev>"}</p>
      <div className="mt-12 pl-[4ch]">
        <h1 className="text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-ink sm:text-[3.35rem]">
          {headCommit.name}
        </h1>
        <p className="mt-6 max-w-[66ch] text-base leading-7 text-ink">{headCommit.message}</p>
      </div>
    </header>
  );
}

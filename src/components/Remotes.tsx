import { existsSync } from "node:fs";
import path from "node:path";
import { Prompt } from "@/components/Prompt";

type Remote = {
  name: string;
  href: string;
  label: string;
};

const remotes: Remote[] = [
  { name: "mail", href: "mailto:ren@icyren.dev", label: "ren@icyren.dev" },
  { name: "github", href: "https://github.com/rennixx", label: "github.com/rennixx" },
  {
    name: "linkedin",
    href: "https://linkedin.com/in/vrynyx",
    label: "linkedin.com/in/vrynyx",
  },
];

const includeCv = existsSync(path.join(process.cwd(), "public", "cv.pdf"));

export function Remotes() {
  const rows = includeCv
    ? [...remotes, { name: "cv", href: "/cv.pdf", label: "cv.pdf" }]
    : remotes;

  return (
    <section className="mt-20 sm:mt-24" aria-labelledby="remotes-heading">
      <h2 id="remotes-heading" className="font-normal">
        <Prompt command="git remote -v" />
      </h2>
      <ul className="mt-8 list-none p-0">
        {rows.map((remote) => {
          const external = remote.href.startsWith("http");
          return (
            <li
              key={remote.name}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 py-1.5 text-[13.5px] leading-6"
            >
              <span className="text-muted">{remote.name}</span>
              <a
                href={remote.href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="w-fit max-w-full text-ink underline decoration-line underline-offset-4 hover:text-gold hover:decoration-gold"
              >
                {remote.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import type { ReactNode } from "react";

export function PageShell({ children }: { children?: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[980px] px-5 py-14 sm:px-10 sm:py-24">
      {children}
    </main>
  );
}

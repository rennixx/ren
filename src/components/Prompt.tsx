export function Prompt({ command }: { command: string }) {
  return (
    <span className="text-[13px] leading-6 text-muted">
      <span className="text-ink">ren@icyren</span>
      {" ~ "}
      <span className="text-gold">(main)</span>
      {" $ "}
      <span className="text-ink">{command}</span>
    </span>
  );
}

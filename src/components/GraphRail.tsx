import type { GraphKind } from "@/data/log";

const MAIN_X = 9;
const BRANCH_X = 23;
const DOT = 7;
/** Center of the dot, lined up with the first line of the commit row. */
const DOT_CENTER = 28;

function Dot({ x, color }: { x: number; color: string }) {
  return (
    <span
      className="absolute rounded-full"
      style={{
        left: x - DOT / 2,
        top: DOT_CENTER - DOT / 2,
        width: DOT,
        height: DOT,
        background: color,
        boxShadow: "0 0 0 3px #161615",
      }}
    />
  );
}

export function GraphRail({ kind }: { kind: GraphKind }) {
  if (kind === "branch") {
    return (
      <div className="relative w-9 self-stretch" aria-hidden="true">
        <span className="absolute bottom-0 top-0 w-px bg-gold" style={{ left: MAIN_X }} />
        <span
          className="absolute w-px bg-mint"
          style={{ left: BRANCH_X, top: DOT_CENTER, bottom: DOT_CENTER }}
        />
        <Dot x={BRANCH_X} color="#7fd1b0" />
        <svg
          className="absolute left-0 top-0 overflow-visible"
          width="36"
          height={DOT_CENTER}
          aria-hidden="true"
        >
          <line
            x1={MAIN_X + 0.5}
            y1={0}
            x2={BRANCH_X + 0.5}
            y2={DOT_CENTER}
            stroke="#7fd1b0"
            strokeWidth="1"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 overflow-visible"
          width="36"
          height={DOT_CENTER}
          aria-hidden="true"
        >
          <line
            x1={BRANCH_X + 0.5}
            y1={0}
            x2={MAIN_X + 0.5}
            y2={DOT_CENTER}
            stroke="#7fd1b0"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  const through = kind === "main";

  return (
    <div className="relative w-9 self-stretch" aria-hidden="true">
      <span
        className="absolute w-px bg-gold"
        style={
          through
            ? { left: MAIN_X, top: 0, bottom: 0 }
            : kind === "head"
              ? { left: MAIN_X, top: DOT_CENTER, bottom: 0 }
              : { left: MAIN_X, top: 0, height: DOT_CENTER }
        }
      />
      <Dot x={MAIN_X} color="#d9b35a" />
    </div>
  );
}

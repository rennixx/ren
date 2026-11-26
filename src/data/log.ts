export type GraphKind = "head" | "main" | "branch" | "root";

export type CommitTag = "proto" | "MIT" | "live";

export type LogEntry = {
  id: string;
  hash: string;
  tag?: CommitTag;
  message: string;
  stack?: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  install?: string;
  graph: GraphKind;
};

export const headCommit = {
  hash: "c0b8ef0",
  name: "Mohammed M.",
  message:
    "Full-stack & AI engineer in Erbil, Iraq. I build web products end to end, and the checks that decide when a model's output is safe to act on. Open to remote ML and full-stack roles.",
};

export const commits: LogEntry[] = [
  {
    id: "sentinel",
    hash: "8c7e311",
    tag: "proto",
    message: "Sentinel — calibrated confidence for LLM outputs",
    stack: "Python · FastAPI · scikit-learn",
    description:
      "Scores a model answer with a calibrated confidence, so a product can decide when that output is safe to act on. The service is Python, FastAPI, and scikit-learn.",
    graph: "head",
  },
  {
    id: "structra",
    hash: "bd6973c",
    tag: "proto",
    message: "Structra — unstructured text in, validated JSON out",
    stack: "schema-validated · multi-stage",
    description:
      "Unstructured text goes in and schema-validated JSON comes out. The check is multi-stage, and a value that misses the schema does not pass through.",
    graph: "main",
  },
  {
    id: "missing-piece",
    hash: "df79b46",
    tag: "MIT",
    message: "Missing Piece — agent skills for AI coding agents",
    stack: "agent skills",
    description:
      "A set of skills for AI coding agents, published under the MIT license. Add the set to an agent with the install command.",
    install: "npx skills add rennixx/missing-piece",
    href: "https://github.com/rennixx/missing-piece",
    hrefLabel: "github.com/rennixx/missing-piece",
    graph: "main",
  },
  {
    id: "mam-center",
    hash: "947af8c",
    tag: "live",
    message: "Mam Center — booking in Kurdish and Arabic, right to left",
    stack: "Kurdish · Arabic · RTL",
    description:
      "A booking site in Kurdish and Arabic, laid out right to left. It is live for anyone reserving a time.",
    href: "https://mamcenter.krd",
    hrefLabel: "mamcenter.krd",
    graph: "branch",
  },
  {
    id: "root",
    hash: "71e0352",
    message: "start freelancing, 2021",
    description: "The root of this log. Independent work since October 2021.",
    graph: "root",
  },
];

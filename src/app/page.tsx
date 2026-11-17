import { CommitGraph } from "@/components/CommitGraph";
import { HeadCommit } from "@/components/HeadCommit";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  return (
    <PageShell>
      <HeadCommit />
      <CommitGraph />
    </PageShell>
  );
}

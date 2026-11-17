import { CommitGraph } from "@/components/CommitGraph";
import { HeadCommit } from "@/components/HeadCommit";
import { PageShell } from "@/components/PageShell";
import { Remotes } from "@/components/Remotes";

export default function Home() {
  return (
    <PageShell>
      <HeadCommit />
      <CommitGraph />
      <Remotes />
    </PageShell>
  );
}

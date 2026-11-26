import { CommitGraph } from "@/components/CommitGraph";
import { NowPlaying } from "@/components/NowPlaying";
import { HeadCommit } from "@/components/HeadCommit";
import { PageShell } from "@/components/PageShell";
import { Remotes } from "@/components/Remotes";

export default function Home() {
  return (
    <PageShell>
      <NowPlaying />
      <HeadCommit />
      <CommitGraph />
      <Remotes />
    </PageShell>
  );
}

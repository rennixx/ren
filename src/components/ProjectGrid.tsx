import profileData from "@/data/profile.json";

export default function ProjectGrid() {
  const githubUrl = profileData.contact.github;

  return (
    <div className="relative h-full">
      <div className="panel-clip panel-border w-full h-full p-3.5 relative flex flex-col items-center justify-center">
        <span className="text-[11px] text-accent/60 tracking-[2px] uppercase mb-4">
          {"PROJECTS"}
        </span>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-clip px-5 py-2.5 border border-accent text-accent text-xs uppercase tracking-[2px] cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15),inset_0_0_10px_rgba(0,229,255,0.05)] hover:shadow-[0_0_16px_rgba(0,229,255,0.25),inset_0_0_16px_rgba(0,229,255,0.1)] hover:bg-accent/[0.06] transition-all"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}

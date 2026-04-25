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
          className="relative inline-flex items-center justify-center text-accent text-xs uppercase tracking-[2px] cursor-pointer transition-all group"
          style={{ padding: "10px 28px" }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 44"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points="10,0 190,0 200,10 200,34 190,44 10,44 0,34 0,10"
              fill="rgba(0,229,255,0.02)"
              stroke="#00e5ff"
              strokeWidth="1.5"
            />
          </svg>
          <span className="relative z-10 group-hover:text-white transition-colors">
            View on GitHub
          </span>
        </a>
      </div>
    </div>
  );
}

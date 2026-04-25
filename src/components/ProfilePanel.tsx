import HexAvatar from "./HexAvatar";
import profileData from "@/data/profile.json";

export default function ProfilePanel() {
  const { name, title, bio, skills, contact } = profileData;

  const contactLabels: Record<string, string> = {
    github: "GH",
    linkedin: "LI",
    email: "EM",
    twitter: "TW",
  };

  return (
    <div className="panel-clip panel-border h-full p-5 flex flex-col">
      <div className="flex justify-between items-center mb-3.5">
        <span className="text-[8px] text-accent/60 tracking-[2px] uppercase">
          // User.Profile
        </span>
        <span className="text-[7px] text-accent/50 font-mono">0x7A3F</span>
      </div>

      <HexAvatar />

      <div className="text-center mb-1">
        <div className="text-[15px] font-bold text-text-primary tracking-wider">
          {name}
        </div>
        <div className="text-[9px] text-accent tracking-[2px] uppercase mt-1">
          {title}
        </div>
      </div>

      <div className="circuit-separator my-3.5">
        <div className="circuit-dot" />
      </div>

      <p className="text-[10px] text-text-secondary leading-relaxed text-center mb-3.5">
        {bio}
      </p>

      <div className="text-[8px] text-accent/60 tracking-[2px] uppercase mb-2">
        // Tech Stack
      </div>

      <div className="flex flex-col gap-1.5">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between text-[9px] text-text-secondary mb-0.5">
              <span>{skill.name}</span>
              <span className="text-accent">{skill.level}%</span>
            </div>
            <div className="skill-bar-track">
              <div
                className="skill-bar-fill"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="circuit-separator mb-2">
          <div className="circuit-dot" />
        </div>
        <div className="flex justify-center gap-1.5">
          {Object.entries(contact).map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 border border-accent/35 flex items-center justify-center text-[9px] text-accent icon-clip hover:bg-accent/10 transition-colors"
              aria-label={key}
            >
              {contactLabels[key] ?? key.slice(0, 2).toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
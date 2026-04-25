import ProjectCard from "./ProjectCard";
import profileData from "@/data/profile.json";

export default function ProjectGrid() {
  const { projects } = profileData;

  return (
    <div className="relative h-full">
      <div className="panel-clip panel-border w-full h-full p-3.5 relative">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[11px] text-accent/60 tracking-[2px] uppercase">
            {"// Projects.Array"}
          </span>
          <span className="text-[11px] text-accent/50 font-mono">
            [0..{projects.length - 1}]
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 h-[calc(100%-26px)]">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              tags={project.tags}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
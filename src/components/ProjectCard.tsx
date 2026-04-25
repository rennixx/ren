interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export default function ProjectCard({
  id,
  name,
  description,
  tags,
}: ProjectCardProps) {
  return (
    <div className="card-clip border border-accent/15 p-2.5 relative bg-accent/[0.01] hover:bg-accent/[0.04] hover:border-accent/30 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-1">
        <div className="text-[11px] text-text-primary font-bold group-hover:text-accent transition-colors">
          {name}
        </div>
        <div className="text-[7px] text-accent/60 font-mono">#{id}</div>
      </div>
      <div className="text-[9px] text-text-tertiary mb-1.5 leading-relaxed">
        {description}
      </div>
      <div className="flex gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[7px] text-accent/70 px-[5px] py-px border border-accent/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
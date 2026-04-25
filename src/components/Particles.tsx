export default function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1.5,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.15 + 0.08,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * -20,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-accent"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

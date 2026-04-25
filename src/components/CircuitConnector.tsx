interface CircuitConnectorProps {
  direction: "horizontal" | "vertical";
  className?: string;
}

export default function CircuitConnector({
  direction,
  className = "",
}: CircuitConnectorProps) {
  if (direction === "horizontal") {
    return (
      <div
        className={`absolute z-0 h-[2px] ${className}`}
        style={{
          width: "16px",
          background:
            "linear-gradient(90deg, rgba(0,229,255,0.4), transparent)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`absolute z-0 w-[2px] ${className}`}
      style={{
        height: "16px",
        background:
          "linear-gradient(180deg, rgba(0,229,255,0.4), transparent)",
      }}
      aria-hidden="true"
    />
  );
}
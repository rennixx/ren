import Image from "next/image";
import profileData from "@/data/profile.json";

export default function HexAvatar() {
  return (
    <div className="relative w-[72px] h-[72px] mx-auto mb-3.5">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        className="absolute inset-0"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.3))" }}
        aria-hidden="true"
      >
        <polygon
          points="36,4 66,22 66,50 36,68 6,50 6,22"
          fill="rgba(0,229,255,0.05)"
          stroke="#00e5ff"
          strokeWidth="1"
        />
        <polygon
          points="36,14 56,26 56,46 36,58 16,46 16,26"
          fill="none"
          stroke="rgba(0,229,255,0.3)"
          strokeWidth="0.5"
          strokeDasharray="3,3"
        />
        <clipPath id="hex-clip">
          <polygon points="36,8 62,24 62,48 36,64 10,48 10,24" />
        </clipPath>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={profileData.avatar}
          alt="Avatar"
          width={54}
          height={54}
          className="object-cover"
          style={{ clipPath: "polygon(50% 4%, 93% 25%, 93% 75%, 50% 96%, 7% 75%, 7% 25%)" }}
        />
      </div>
    </div>
  );
}

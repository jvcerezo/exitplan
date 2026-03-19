import { type CSSProperties } from "react";

type LogoIconProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Sandalan Logo — Stylized Baybayin "sa" (ᜐ), the first syllable of "Sandalan".
 *
 * The vertical stroke represents the "sandalan" (pillar / something to lean on).
 * The flowing curve represents the person leaning — trust, support, guidance.
 * The kudlit (dot) is a traditional Baybayin vowel marker used here as a design accent.
 */
export function LogoIcon({ className = "w-12 h-12", style }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      style={style}
      aria-label="Sandalan Logo"
      role="img"
    >
      {/* Vertical pillar — the "sandalan" (support) */}
      <path
        d="M 62 25 Q 60 100, 62 175"
        stroke="#14213D"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />

      {/* Curved stroke of Baybayin "sa" — person leaning / embrace */}
      <path
        d="M 62 28 C 140 28, 170 78, 155 118 C 140 155, 98 178, 62 178"
        fill="none"
        stroke="#55C48A"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Kudlit (vowel accent dot) — traditional Baybayin element */}
      <circle cx="150" cy="44" r="10" fill="#55C48A" />
    </svg>
  );
}

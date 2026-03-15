import { type CSSProperties } from "react";

type LogoIconProps = {
  className?: string;
  style?: CSSProperties;
};

export function LogoIcon({ className = "w-12 h-12", style }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      style={style}
      aria-label="ExitPlan Logo"
      role="img"
    >
      <defs>
        <mask id="exitplan-arrow-gap">
          <rect width="200" height="200" fill="white" />
          <path
            d="M 40 170 C 40 125, 60 100, 100 90 L 95 81 L 145 75 L 115 115 L 110 107 C 70 120, 45 150, 40 170 Z"
            fill="black"
            stroke="black"
            strokeWidth="12"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      <g transform="translate(8 0)">
        <path
          d="M 40 30 H 140 V 60 H 70 V 140 H 140 V 170 H 40 Z"
          fill="#14213D"
          mask="url(#exitplan-arrow-gap)"
        />
        <path
          d="M 40 170 C 40 125, 60 100, 100 90 L 95 81 L 145 75 L 115 115 L 110 107 C 70 120, 45 150, 40 170 Z"
          fill="#55C48A"
        />
      </g>
    </svg>
  );
}
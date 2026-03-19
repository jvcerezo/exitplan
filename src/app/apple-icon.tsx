import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14213D",
          borderRadius: "32px",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="132" height="132" aria-label="Sandalan Logo">
          {/* Vertical pillar */}
          <path
            d="M 62 25 Q 60 100, 62 175"
            stroke="#F7FBF8"
            strokeWidth="24"
            strokeLinecap="round"
            fill="none"
          />
          {/* Baybayin "sa" curve */}
          <path
            d="M 62 28 C 140 28, 170 78, 155 118 C 140 155, 98 178, 62 178"
            fill="none"
            stroke="#55C48A"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Kudlit dot */}
          <circle cx="150" cy="44" r="10" fill="#55C48A" />
        </svg>
      </div>
    ),
    size
  );
}

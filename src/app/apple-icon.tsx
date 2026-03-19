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
          <line x1="108" y1="36" x2="40" y2="86" stroke="#55C48A" strokeWidth="7" strokeLinecap="butt" />
          <line x1="92" y1="36" x2="160" y2="86" stroke="#55C48A" strokeWidth="7" strokeLinecap="butt" />
          <polygon points="100,50 60,80 140,80" fill="#F7FBF8" />
          <rect x="48" y="79" width="104" height="4" fill="#F7FBF8" />
          <polygon points="52,86 66,86 66,126 58,126" fill="#F7FBF8" />
          <path d="M 69 86 H 131 V 126 H 111 V 102 H 89 V 126 H 69 Z" fill="#F7FBF8" />
          <polygon points="134,86 148,86 142,126 134,126" fill="#F7FBF8" />
          <rect x="57" y="129" width="86" height="5" fill="#F7FBF8" />
          <rect x="68" y="134" width="7" height="10" fill="#F7FBF8" />
          <rect x="96" y="134" width="7" height="10" fill="#F7FBF8" />
          <rect x="124" y="134" width="7" height="10" fill="#F7FBF8" />
          <rect x="48" y="144" width="104" height="5" fill="#F7FBF8" />
        </svg>
      </div>
    ),
    size
  );
}

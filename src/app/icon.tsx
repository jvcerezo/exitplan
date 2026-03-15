import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1B2D",
          borderRadius: "50%",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="512" height="512">
          <circle cx="100" cy="100" r="100" fill="#0F1B2D" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="#3ECFAD" strokeWidth="5" />
          <rect x="62" y="58" width="18" height="84" rx="3" fill="#FFFFFF" />
          <rect x="62" y="58" width="56" height="18" rx="3" fill="#FFFFFF" />
          <rect x="62" y="91" width="44" height="16" rx="3" fill="#FFFFFF" />
          <rect x="62" y="124" width="56" height="18" rx="3" fill="#FFFFFF" />
          <line x1="96" y1="117" x2="132" y2="78" stroke="#3ECFAD" strokeWidth="11" strokeLinecap="round" />
          <polyline points="110,72 138,72 138,100" fill="none" stroke="#3ECFAD" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}
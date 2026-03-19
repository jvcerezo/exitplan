import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background: "linear-gradient(135deg, #0F3D27 0%, #1E6B45 45%, #2D8659 100%)",
          color: "#FFFFFF",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.18)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="56" height="56" aria-label="Sandalan Logo">
              <path d="M 62 25 Q 60 100, 62 175" stroke="#14213D" strokeWidth="24" strokeLinecap="round" fill="none" />
              <path d="M 62 28 C 140 28, 170 78, 155 118 C 140 155, 98 178, 62 178" fill="none" stroke="#55C48A" strokeWidth="20" strokeLinecap="round" />
              <circle cx="150" cy="44" r="10" fill="#55C48A" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, opacity: 0.92 }}>Sandalan</div>
            <div style={{ fontSize: "20px", opacity: 0.72 }}>
              Financial Freedom Tracker for Filipinos
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "880px" }}>
          <div style={{ fontSize: "68px", fontWeight: 800, lineHeight: 1.05 }}>
            Track every peso. Build your freedom plan.
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.35, opacity: 0.86 }}>
            Budgets, savings goals, cash flow visibility, and financial progress in one calm dashboard.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "18px",
            fontSize: "22px",
            opacity: 0.92,
          }}
        >
          <div style={{ padding: "14px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.14)" }}>
            Savings Goals
          </div>
          <div style={{ padding: "14px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.14)" }}>
            Smart Budgets
          </div>
          <div style={{ padding: "14px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.14)" }}>
            Expense Tracking
          </div>
        </div>
      </div>
    ),
    size
  );
}
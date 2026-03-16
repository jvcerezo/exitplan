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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="56" height="56" aria-label="ExitPlan Logo">
              <defs>
                <mask id="og-arrow-gap">
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
              <path d="M 40 30 H 140 V 60 H 70 V 140 H 140 V 170 H 40 Z" fill="#14213D" mask="url(#og-arrow-gap)" />
              <path d="M 40 170 C 40 125, 60 100, 100 90 L 95 81 L 145 75 L 115 115 L 110 107 C 70 120, 45 150, 40 170 Z" fill="#55C48A" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, opacity: 0.92 }}>ExitPlan</div>
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
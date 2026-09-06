import { ImageResponse } from "next/og";

export const alt = "Traballo — le business pack des artisans";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#155BA2";
const INK = "#0F1626";

async function loadFont(weight: 500 | 700): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      `https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-${weight}-normal.ttf`
    );
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [medium, bold] = await Promise.all([loadFont(500), loadFont(700)]);
  const fonts = [
    medium && { name: "Space Grotesk", data: medium, weight: 500 as const },
    bold && { name: "Space Grotesk", data: bold, weight: 700 as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 500 | 700 }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${INK} 0%, ${BLUE} 100%)`,
          color: "#fff",
          fontFamily: "Space Grotesk, sans-serif",
          padding: 72,
          position: "relative",
        }}
      >
        {/* blueprint grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* top: mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 100 100" fill={BLUE}>
              <path d="M 8,8 L 92,8 L 92,42 L 73,42 L 73,30 L 61,30 L 61,60 L 39,72 L 39,30 L 27,30 L 27,42 L 8,42 Z" />
              <path d="M 61,71 L 39,83 L 39,92 L 61,92 Z" />
            </svg>
          </div>
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            Traballo
          </span>
        </div>

        {/* middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Le business pack des artisans
          </span>
          <span
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 820,
            }}
          >
            Site web, factures conformes Factur-X, agent IA et rendez-vous —
            dans un seul tableau de bord.
          </span>
        </div>

        {/* bottom: chips */}
        <div style={{ display: "flex", gap: 14 }}>
          {["France", "Belgique", "Luxembourg", "0 à 49 €/mois"].map((c) => (
            <span
              key={c}
              style={{
                fontSize: 22,
                fontWeight: 500,
                padding: "10px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}

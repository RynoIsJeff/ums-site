import { ImageResponse } from "next/og";

// Route: https://ultimatemarketingsmash.com/og?title=Your%20Title
export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Ultimate Marketing Smash";
  const subtitle = searchParams.get("subtitle") || "Build • Ship • Grow";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "white",
          fontFamily: "Inter, Arial, Helvetica, sans-serif",
        }}
      >
        {/* background accents */}
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -140,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(5,134,173,0.18), transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(2,214,228,0.18), transparent 65%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 64,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#030303",
              fontSize: 28,
              opacity: 0.7,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #0586AD, #02D6E4)",
              }}
            />
            Ultimate Marketing <span style={{ color: "#0586AD" }}>Smash</span>
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.08,
              color: "#030303",
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 32,
              color: "#333",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "Someone";
    const imageUrl =
      searchParams.get("image") ||
      "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/TanmayIMG_4211.jpeg";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1E1E1E",
            backgroundImage:
              "radial-gradient(circle at 25% 75%, #2A2A2A 0%, transparent 50%), radial-gradient(circle at 75% 25%, #2A2A2A 0%, transparent 50%)",
            padding: "40px",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              width: "90%",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
                textAlign: "center",
              }}
            >
              <img
                src={imageUrl}
                alt={`${name}'s profile`}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "60px",
                  objectFit: "cover",
                  border: "4px solid #A78BFA",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    color: "#FFFFFF",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textTransform: "capitalize",
                  }}
                >
                  {name.split(" ")[0]}! Inviting
                </span>
                <span
                  style={{
                    fontSize: 32,
                    color: "#A78BFA",
                    fontWeight: 600,
                    lineHeight: 0.5,
                  }}
                >
                  You listen to songs together?
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(167, 139, 250, 0.1)",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  cursor: "pointer",
                  marginTop: "28px",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(167, 139, 250, 0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(167, 139, 250, 0.1)")
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 18V5l12 6.5L9 18z" fill="#A78BFA" />
                </svg>
                <span
                  style={{
                    fontSize: 18,
                    color: "#FFFFFF",
                    fontWeight: 600,
                  }}
                >
                  Join the Vibe
                </span>
              </div>
              {/* <span
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 400,
                }}
              >
                getvibe.in
              </span> */}
            </div>
          </div>
        </div>
      ),
      {
        width: 736,
        height: 464,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

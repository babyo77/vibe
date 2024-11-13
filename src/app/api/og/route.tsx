/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@500&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("Failed to load font data");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "404";
    const invite = "Hey";
    const vibe = "wanna listen";
    const songs = "songs together?";
    const imageUrl =
      searchParams.get("image") ||
      "https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/TanmayIMG_4211.jpeg";

    const fullText = `${
      name.split(" ")[0].charAt(0).toUpperCase() + name.split(" ")[0].slice(1)
    } ${invite} ${vibe} ${songs}`;
    const fontData = await loadGoogleFont("Geist", fullText);

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
            backgroundImage:
              'url("https://us-east-1.tixte.net/uploads/tanmay111-files.tixte.co/Invite_Card.jpg")',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            padding: "37px 32px",
            fontFamily: '"Geist", sans-serif',
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              padding: "30px",
              // background: "transperant",
              borderRadius: "30px",
              boxShadow: "0 0 100px rgba(147, 51, 234, 0.5)",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "100%",
                height: "100%",
                background: "transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0px",
                  background: "transparent",
                  width: "75%",
                }}
              >
                <span
                  style={{
                    fontSize: 64,
                    color: "#A78BFA",
                    fontWeight: "600",
                    letterSpacing: "-1px",
                    lineHeight: ".9",
                  }}
                >
                  Hey,
                </span>
                <span
                  style={{
                    fontSize: 64,
                    color: "#ffffff",
                    fontWeight: "500",
                    lineHeight: ".85",
                    letterSpacing: "-3px",
                  }}
                >
                  wanna listen songs together?
                </span>
                <span
                  style={{
                    fontSize: 54,
                    color: "#ffffff80",
                    fontWeight: 500,
                    lineHeight: "1.2",
                    letterSpacing: "-2px",
                  }}
                >
                  -{" "}
                  {name.split(" ")[0].charAt(0).toUpperCase() +
                    name.split(" ")[0].slice(1)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  width: "100%",
                }}
              >
                <img
                  src="https://getvibe.in/logo.svg"
                  alt="Vibe Logo"
                  style={{
                    width: "64.8",
                    height: "49.2px",
                  }}
                />
                <span
                  style={{
                    fontSize: 24,
                    color: "white",
                    fontWeight: 200,
                  }}
                >
                  getvibe.in
                </span>
              </div>
            </div>

            <img
              src={imageUrl}
              alt="Profile"
              style={{
                position: "absolute",
                top: "30px",
                right: "30px",
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "100px",
                background: "transparent",
              }}
            />
          </div>
        </div>
      ),
      {
        width: 736,
        height: 464,
        fonts: [
          {
            name: "Geist",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

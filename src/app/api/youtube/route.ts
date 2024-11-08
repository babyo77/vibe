import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "tanmayo7lock";
import ytpl from "ytpl";
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) throw new Error("Invalid song ID");
  try {
    const playlist = await ytpl(id, {
      pages: 2,
      requestOptions: { headers: { Cookie: process.env.COOKIES || "" } },
    });
    if (!playlist.items) throw new Error("Invalid playlist");
    const tracks = playlist.items.map((s) => ({
      id: s.id,
      name: s.title,
      artists: {
        primary: [
          {
            id: s.author.channelID,
            name: s.author.name,
            role: "",
            image: [],
            type: "artist",
            url: s.author.url,
          },
        ],
      },
      image: [
        {
          quality: "500x500",
          url: `https://wsrv.nl/?url=${s.thumbnails[
            s.thumbnails.length - 1
          ].url?.replace(/w\d+-h\d+/, "w500-h500")}`,
        },
      ],
      source: "youtube",
      downloadUrl: [
        {
          quality: "320kbps",
          url: `${encrypt(s.id)}`,
        },
      ],
    }));

    return NextResponse.json(tracks);
  } catch (error: any) {
    console.log(error?.message);
    return NextResponse.json(
      { msg: "Error importing playlist" },
      { status: 500 }
    );
  }
}

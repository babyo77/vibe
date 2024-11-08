import { searchSongResult } from "@/lib/types";
import { ytmusic } from "@/lib/ytMusic";
import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "tanmayo7lock";
import { Innertube } from "youtubei.js";

export async function GET(req: NextRequest) {
  try {
    // Initialize YouTube music and Innertube
    await ytmusic.initialize({
      cookies: process.env.COOKIES,
    });

    const page = Number(req.nextUrl.searchParams.get("page")) || 0;
    const search = req.nextUrl.searchParams.get("name") || "";

    if (!search) throw new Error("Search not found");

    let yt = null;
    if (search.startsWith("http")) {
      yt = await Innertube.create({
        cookie: process.env.COOKIES,
      });
    }

    // Fetch data concurrently
    const [data, ytSongs, yt2Songs] = await Promise.all([
      !search.startsWith("https")
        ? fetch(
            `${
              process.env.BACKEND_URI
            }/api/search/songs?query=${encodeURIComponent(
              search
            )}&page=${page}&limit=5`,
            {
              cache: "force-cache",
            }
          )
        : null,
      page == 0
        ? !search.startsWith("http")
          ? ytmusic.searchSongs(search)
          : null
        : null,
      yt ? yt.search(search) : null,
    ]);

    const result = data
      ? ((await data.json()) as searchSongResult)
      : {
          data: {
            total: 0,
            start: 0,
            results: [],
          },
        };

    const songs =
      ytSongs?.map((s) => ({
        id: s.videoId,
        name: s.name,
        artists: {
          primary: [
            {
              id: s.artist.artistId,
              name: s.artist.name,
              role: "",
              image: [],
              type: "artist",
              url: "",
            },
          ],
        },
        image: [
          {
            quality: "500x500",
            url: `https://wsrv.nl/?url=${s.thumbnails[
              s.thumbnails.length - 1
            ].url.replace(/w\d+-h\d+/, "w500-h500")}`,
          },
        ],
        source: "youtube",
        downloadUrl: [
          {
            quality: "320kbps",
            url: `${encrypt(s.videoId)}`,
          },
        ],
      })) || [];

    const songs2 =
      yt2Songs?.results
        .filter((result) => result.type === "Video")
        .slice(0, 1)
        .map((s: any) => ({
          id: s.id,
          name: s.title.text,
          artists: {
            primary: [
              {
                id: s.author.id,
                name: s.author.name,
                role: "",
                image: s.author.thumbnails.map((thumb: any) => ({
                  url: thumb.url,
                })),
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
              ].url.replace(/w\d+-h\d+/, "w500-h500")}`,
            },
          ],
          source: "youtube",
          downloadUrl: [
            {
              quality: "320kbps",
              url: `${encrypt(s.id)}`,
            },
          ],
        })) || [];

    return NextResponse.json(
      {
        data: {
          ...result.data,
          results: [
            ...result.data.results.slice(0, 4),
            ...songs2,
            ...songs,
            ...result.data.results.slice(4),
          ],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch", error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateRoomId } from "./utils/utils";

export default async function middleware(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const vibeId = req.cookies.get("vibeId")?.value;
    const room = url.searchParams.get("room");

    if (url.pathname == "/") {
      const isLoggedIn = await fetch(`${process.env.SOCKET_URI}/api/@me`, {
        headers: {
          cookie: `vibeIdR=${vibeId}`,
        },
      });
      if (isLoggedIn.ok) {
        return NextResponse.redirect(new URL("/browse", req.nextUrl.origin));
      }
    }
    if (room) {
      const res = NextResponse.next();
      res.cookies.set("room", room, { path: "/", httpOnly: true });
      return res;
    }

    if (url.pathname.startsWith("/v")) {
      if (!room) {
        const newRoomId = generateRoomId();
        const res = NextResponse.redirect(
          new URL(`${url.pathname}?room=${newRoomId}`, req.url)
        );
        res.cookies.set("room", newRoomId, { path: "/", httpOnly: true });
        return res;
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.next();
  }
}

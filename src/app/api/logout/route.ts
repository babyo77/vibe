import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    cookies().delete("vibeId");
    return NextResponse.redirect(new URL("/v", req.nextUrl));
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
export const runtime = "edge";

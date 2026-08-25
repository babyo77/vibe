import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token: accessToken } = await req.json();
    if (accessToken) {
      const response = NextResponse.json({ success: true });

      const cookieExpirationDate = new Date();
      cookieExpirationDate.setDate(cookieExpirationDate.getDate() + 30);

      response.cookies.set("vibeId", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        expires: cookieExpirationDate,
      });
      return response;
    }
    return NextResponse.json({ success: false, data: {} }, { status: 500 });
  } catch (error: any) {
    console.log(error.message);

    return NextResponse.json(
      { success: false, data: {}, message: error?.message },
      { status: 500 }
    );
  }
}

export const runtime = "edge";

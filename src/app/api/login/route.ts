import dbConnect from "@/lib/dbConnect";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User as userType } from "firebase/auth";

const jwt_secret = process.env.JWT_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const data: userType = await req.json();
    await dbConnect();

    const isAlready = await User.findOne({ email: data.email });
    if (isAlready) {
      const user = await User.findOneAndUpdate(
        { email: data.email },
        { imageUrl: data.photoURL },
        { new: true }
      );
      return proceed(user);
    } else {
      const user = await User.create({
        username: data.email?.split("@gmail.com")[0],
        name: data.displayName,
        email: data.email,
        imageUrl: data.photoURL,
      });

      if (user) {
        return proceed(user);
      }
    }

    return NextResponse.json({ success: false, data: {} }, { status: 500 });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      { success: false, data: {}, message: error?.message },
      { status: 500 }
    );
  }
}

const proceed = (saved: any) => {
  const accessToken = jwt.sign({ userId: saved._id }, jwt_secret, {
    expiresIn: "7d",
  });

  // Create a response and set the cookie
  const response = NextResponse.json({ success: true, data: saved });

  response.cookies.set("vibeId", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
  });

  return response;
};

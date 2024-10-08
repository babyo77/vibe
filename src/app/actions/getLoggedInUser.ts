"use server";

import dbConnect from "@/lib/dbConnect";
import Room from "@/models/roomModel";
import RoomUser from "@/models/roomUsers";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getLoggedInUser() {
  try {
    const session = cookies().get("vibeId");
    const roomId = cookies().get("room")?.value;
    if (!session || !session.value) {
      throw new Error("No session found");
    }

    const decoded: any = jwt.verify(
      session.value,
      process.env.JWT_SECRET || ""
    );
    if (!decoded || !decoded.userId) {
      throw new Error("Invalid token");
    }

    await dbConnect();

    const [user, room] = await Promise.all([
      User.findById(decoded.userId), // Fetch the user by ID
      Room.findOne({ roomId }), // Fetch the room by roomId
    ]);

    const role = await RoomUser.findOne({
      userId: decoded.userId,
      roomId: room?._id,
    }).select("role");

    return JSON.parse(
      JSON.stringify({
        ...user.toObject(),
        token: session.value,
        roomId: roomId,
        role: role?.toObject()?.role,
      })
    );
  } catch (error: any) {
    console.error("Error in getLoggedInUser:", error.message);
    return null;
  }
}

import dbConnect from "@/lib/dbConnect";
import Room from "@/models/roomModel";
import RoomUser from "@/models/roomUsers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const roomId = req.cookies.get("room")?.value;
  const room = await Room.findOne({ roomId });
  if (!roomId || !room) throw new Error("Invalid roomId");
  try {
    const roomUsers = await RoomUser.find({
      roomId: room._id,
      active: true,
    })
      .populate({
        path: "userId", // The path to populate
        select: "name username imageUrl ", // Only select the 'name' and 'username' fields
      })
      .limit(17)
      .select("userId -_id");

    const totalListeners = await RoomUser.countDocuments({
      roomId: room._id,
      active: true,
    });

    const payload = {
      totalUsers: totalListeners,
      currentPage: 1,
      roomUsers,
    };
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}

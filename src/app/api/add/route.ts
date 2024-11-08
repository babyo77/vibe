import { searchResults } from "@/lib/types";
import Queue from "@/models/queueModel";
import Room from "@/models/roomModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await Queue.startSession();
  session.startTransaction(); // Start transaction

  try {
    const data = (await req.json()) as searchResults[];
    const roomId = req.cookies.get("room")?.value;
    const token = req.cookies.get("vibeId")?.value;

    if (!token) throw new Error("Login Required");
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");

    if (!roomId) throw new Error("Room ID is required.");

    const room = await Room.findOne({ roomId }).session(session); // Room fetch in transaction
    if (!room) throw new Error("Invalid roomId");

    // Fetch existing songs in the queue for the room
    const existingSongs = await Queue.find({ roomId: room._id })
      .select("songData order") // Include order in the selection
      .lean()
      .session(session);

    const existingSongIds = new Set(
      existingSongs.map((song) => song.songData.id)
    );

    // Filter out songs that are not already in the queue
    const songsToAdd = data.filter((song) => !existingSongIds.has(song.id));

    if (songsToAdd.length === 0) {
      // No new songs to add, commit transaction and return
      await session.commitTransaction();
      return NextResponse.json(
        { message: "Song already exist in queue." },
        { status: 400 }
      );
    }

    // Get the maximum order directly from the database
    const maxOrderResult = await Queue.aggregate([
      { $match: { roomId: room._id } },
      { $group: { _id: null, maxOrder: { $max: "$order" } } },
    ]).session(session);

    const maxOrder = maxOrderResult.length > 0 ? maxOrderResult[0].maxOrder : 0;

    // Prepare new songs to be inserted with incremented order
    const newSongs = songsToAdd.map((song, index) => ({
      roomId: room._id,
      isPlaying: existingSongs.length === 0 && index === 0,
      songData: { ...song, addedBy: decoded.userId },
      order: maxOrder + index + 1, // Increment order based on maximum existing order
    }));

    // Insert new songs and update `queueId` in bulk
    const insertedSongs = await Queue.insertMany(newSongs, { session });
    const updates = insertedSongs.map((song) => ({
      updateOne: {
        filter: { _id: song._id },
        update: { "songData.queueId": song._id.toString() },
      },
    }));

    if (updates.length > 0) {
      await Queue.bulkWrite(updates, { session });
    }

    // Commit the transaction after successful insert and update
    await session.commitTransaction();
    return NextResponse.json({
      message: "Songs added to the queue successfully.",
    });
  } catch (error: any) {
    await session.abortTransaction(); // Rollback transaction on error
    console.error("Error adding songs to queue:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    session.endSession(); // End the session
  }
}

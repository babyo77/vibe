import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Queue from "@/models/queueModel";
import Room from "@/models/roomModel";
import { data } from "@/lib/types";
import mongoose from "mongoose";
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    let userId = null;
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 50;
    const name = req.nextUrl.searchParams.get("name") || "";
    const roomId = cookies().get("room")?.value;
    const room = await Room.findOne({ roomId }).select("_id");

    if (!roomId || !room) throw new Error("Invalid roomId");

    const session = cookies().get("vibeId");

    if (session?.value) {
      const decoded: any = jwt.verify(
        session.value,
        process.env.JWT_SECRET || ""
      );
      userId = decoded.userId;
    }
    const [total, results] = await Promise.all([
      Queue.countDocuments({ roomId: room._id }),
      Queue.aggregate(getQueuePipeline(room._id, userId, page, limit, name)),
    ]);
    const payload: data = {
      total,
      start: page,
      results,
    };
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}

function getQueuePipeline(
  roomId: string,
  userId?: string,
  page: number = 1, // Default to page 1 if not provided
  limit: number = 50, // Default to 100 items per page if not provided
  search: string = "" // Default to empty search (return all songs if no search query)
) {
  const pipeline: any[] = [
    {
      $match: {
        roomId: new mongoose.Types.ObjectId(roomId),
      },
    },
    {
      $lookup: {
        from: "votes", // Lookup votes related to the song
        localField: "_id", // Queue field
        foreignField: "queueId", // Vote field to match
        as: "votes", // Alias the votes array
      },
    },
    {
      $lookup: {
        from: "users", // Lookup for users who added songs
        let: { addedBy: "$songData.addedBy" }, // Reference to addedBy field in songData
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$addedBy" }] }, // Match ObjectId of the user who added the song
            },
          },
          {
            $project: {
              _id: 0,
              name: 1, // Include name
              imageUrl: 1, // Include image URL
              username: 1, // Include username
            },
          },
        ],
        as: "addedByUser", // Alias for the user who added the song
      },
    },
    {
      $unwind: {
        path: "$addedByUser", // Unwind the addedByUser array to get a single user object
        preserveNullAndEmptyArrays: true, // If no user is found, still keep the song
      },
    },
    {
      $addFields: {
        "songData.voteCount": { $size: "$votes" }, // Add the number of votes as voteCount
        "songData.addedByUser": "$addedByUser", // Add user info to songData
        "songData.order": "$order", // Add the song's order
        "songData.topVoterIds": {
          $slice: [
            {
              $map: {
                input: {
                  $sortArray: { input: "$votes", sortBy: { createdAt: -1 } }, // Sort votes by most recent
                },
                as: "vote",
                in: "$$vote.userId", // Extract userId from each vote
              },
            },
            2, // Limit to top 2 users
          ],
        },
        "songData.isVoted": {
          $cond: {
            if: {
              $and: [
                { $gt: [{ $size: "$votes" }, 0] }, // Ensure there are votes
                { $ifNull: [userId, false] }, // Ensure userId exists
              ],
            },
            then: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$votes",
                      as: "vote",
                      cond: {
                        $eq: [
                          "$$vote.userId",
                          new mongoose.Types.ObjectId(userId),
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            else: false, // If no userId or no votes, set isVoted to false
          },
        },
        isPlaying: "$isPlaying", // Keep isPlaying for sorting
      },
    },
    {
      $lookup: {
        from: "users", // Lookup for users based on topVoterIds
        localField: "songData.topVoterIds", // Match with topVoterIds
        foreignField: "_id", // Field from the users collection
        as: "songData.topVoters", // Alias for the top voters details
      },
    },
    // Project only name, email, and username for topVoters
    {
      $addFields: {
        "songData.topVoters": {
          $map: {
            input: "$songData.topVoters",
            as: "voter",
            in: {
              name: "$$voter.name",
              username: "$$voter.username",
              imageUrl: "$$voter.imageUrl",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the result
        songData: 1, // Include only the songData field
        isPlaying: 1, // Include isPlaying for sorting
        order: 1,
      },
    },
    {
      $sort: {
        order: -1,
      },
    },
    {
      $replaceRoot: { newRoot: "$songData" }, // Replace the root with songData
    },
    {
      $project: {
        topVoterIds: 0,
      },
    },
  ];

  // Add search functionality based on song name
  if (search && search.trim() !== "") {
    pipeline.push({
      $match: {
        name: { $regex: search, $options: "i" }, // Case-insensitive search for song name
      },
    });
  }

  // Pagination
  pipeline.push(
    { $skip: (page - 1) * limit }, // Skip the number of documents based on the current page
    { $limit: limit } // Limit the number of documents returned per page
  );

  return pipeline;
}

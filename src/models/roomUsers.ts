import mongoose from "mongoose";
import User from "./userModel";
import Room from "./roomModel";

const roomUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    socketid: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Room,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "listener"],
      default: "listener",
    },
  },
  { timestamps: true }
);

const RoomUser =
  mongoose.models?.RoomUsers || mongoose.model("RoomUsers", roomUserSchema);

export default RoomUser;

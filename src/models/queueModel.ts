import mongoose from "mongoose";
import Room from "./roomModel";
import User from "./userModel";

const queueSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Room,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    songData: {
      type: {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        artists: {
          type: {
            primary: [
              {
                name: {
                  type: String,
                },
              },
            ],
          },
        },
        image: {
          type: mongoose.Schema.Types.Mixed,
        },
        source: {
          type: String,
        },
        downloadUrl: {
          type: mongoose.Schema.Types.Mixed,
        },
        addedBy: {
          type: String,
          ref: User,
        },
        queueId: {
          type: String,
        },
      },
      required: true,
    },
    order: {
      type: Number,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);
queueSchema.index({ roomId: 1, order: 1 });
const Queue = mongoose.models?.Queue || mongoose.model("Queue", queueSchema);
export default Queue;

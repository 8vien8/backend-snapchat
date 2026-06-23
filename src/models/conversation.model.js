import mongoose from "mongoose";

const particapantSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // config
  },
);

const groupSchema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const lastMessageSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  content: {
    type: String,
    default: null,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: null,
  },
});

const conversationShema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"], // limitation: 1-1 chat or group chat
      required: true,
    },
    participants: {
      type: [particapantSchema],
      required: true,
    },
    group: {
      type: groupSchema,
    },
    seenBy: [
      // Array
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}, // empty Map
    },
  },
  {
    timestamps: true,
  },
);

conversationShema.index({
  "participant.userId": 1,
  "lastMessage.createdAt": 1,
});

export default mongoose.model("Conversation", conversationShema);

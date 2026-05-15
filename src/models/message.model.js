import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      //   index: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// optimize chat message queries
messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

export default mongoose.model("Message", messageSchema);

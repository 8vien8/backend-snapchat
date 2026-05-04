import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      unique: true,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// tự động xóa khi hết hạn
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("Session", sessionSchema);

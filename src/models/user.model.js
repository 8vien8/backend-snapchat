import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // không trả về mặc định
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/di8bzykms/image/upload/v1778818424/snap_logo.png",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // cho phép null nhưng không duplicate
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);

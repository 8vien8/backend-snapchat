import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new ApiError("", "Unauthorized - Token does not exist"));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return next(
        new ApiError("", "Unauthorized - Token is invalid or expired"),
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new ApiError("", "User do not exist"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

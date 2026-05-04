import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

const JWT_KEY = process.env.ACCESS_TOKEN_SECRET;

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const [scheme, token] = authHeader?.split(" ") || [];

    if (scheme !== "Bearer") {
      throw new ApiError(401, "Invalid authorization format");
    }

    if (!token) {
      throw new ApiError(401, "Access token not found");
    }

    // verify token
    const decoded = jwt.verify(token, JWT_KEY);

    // find user
    // use userId signed when login: ---> jwt.sign({ userId: user.id }
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    next(error);
  }
};

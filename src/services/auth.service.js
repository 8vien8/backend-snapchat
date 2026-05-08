import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const registerUser = async (data) => {
  const { username, password, email, firstname, lastname } = data;

  // check username
  if (await User.findOne({ username })) {
    throw new ApiError(409, "Username already exists");
  }

  // check email
  if (await User.findOne({ email })) {
    throw new ApiError(409, "Email already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    email,
    displayName: `${firstname} ${lastname}`,
  });

  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
};

const JWT_KEY = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = 14 * 60 * 60 * 24 * 1000;

const createSession = ({ userId, refreshToken }) => {
  return Session.create({
    userId: userId,
    refreshToken: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });
};

export const signInUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new ApiError(401, "Invalid credentials");

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) throw new ApiError(401, "Invalid credentials");

  const accesstoken = jwt.sign({ userId: user.id }, JWT_KEY, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

  const refreshToken = crypto.randomBytes(64).toString("hex");

  await createSession({
    userId: user._id,
    refreshToken,
  });

  return { user, accesstoken, refreshToken };
};

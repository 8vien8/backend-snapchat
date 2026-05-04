import Session from "../models/session.model.js";
import {
  registerUser,
  signInUser,
  REFRESH_TOKEN_TTL,
} from "../services/auth.service.js";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

export const signUp = async (req, res, next) => {
  try {
    const data = await registerUser(req.body);

    return res.status(201).json({
      message: "User created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { user, accesstoken, refreshToken } = await signInUser(req.body);

    res.cookie("refreshToken", refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `User ${user.displayName} logged in`,
      accesstoken,
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });
    }

    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

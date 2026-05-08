import Session from "../models/session.model.js";
import {
  registerUser,
  signInUser,
  REFRESH_TOKEN_TTL,
  refreshAccessToken,
} from "../services/auth.service.js";

const isProduction = process.env.NODE_ENV === "production";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
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
    const { user, accessToken, refreshToken } = await signInUser(req.body);

    res.cookie("refreshToken", refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      userName: user.displayName,
      message: `User ${user.displayName} logged in`,
      accessToken,
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

//create new AccessToken from RefreshToken
export const refreshToken = async (req, res, next) => {
  try {
    const accessToken = await refreshAccessToken(req.cookies);

    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

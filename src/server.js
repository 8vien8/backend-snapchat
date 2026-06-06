import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./libs/db.js";

import { errorHandler } from "./middlewares/errorHandler.js";
import { protectedRoute } from "./middlewares/auth.middleware.js";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import friendRoute from "./routes/friend.route.js";
import messageRoute from "./routes/message.route.js";
import conversationRoute from "./routes/conversation.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const CLIENT_URL = process.env.CLIENT_URL;

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// public route
app.use("/api/auth", authRoute);

// private route
app.use(protectedRoute);
app.use("/api/user", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/message", messageRoute);
app.use("/api/conversations", conversationRoute);

// error handler
app.use(errorHandler);

connectDB().then(() => {
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
  });
});

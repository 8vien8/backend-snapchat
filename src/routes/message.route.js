import express from "express";
import {
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/message.controller.js";
import { checkFriendShip } from "../middlewares/friend.middleware.js";

const router = express.Router();

router.post("/direct", checkFriendShip, sendDirectMessage);
router.post("/group", sendGroupMessage);

export default router;

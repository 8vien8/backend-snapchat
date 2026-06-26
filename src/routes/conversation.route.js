import express from "express";
import {
  creatConversation,
  getConversation,
  getMessage,
  markAsSeenMessage,
} from "../controllers/conversation.controller.js";
import { checkFriendShip } from "../middlewares/friend.middleware.js";

const router = express.Router();

router.post("/", checkFriendShip, creatConversation);
router.get("/", getConversation);
router.get("/:conversationId/messages", getMessage);
router.patch("/:conversationId/seen", markAsSeenMessage);

export default router;

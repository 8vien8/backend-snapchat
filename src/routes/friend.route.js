import express from "express";
import {
  acceptAddFriendRequest,
  declineAddFriendRequest,
  getAllFriendRequest,
  getAllFriend,
  sendAddFriendRequest,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/requests", sendAddFriendRequest);

router.post("/requests/:requestId/accept", acceptAddFriendRequest);
router.post("/requests/:requestId/decline", declineAddFriendRequest);

router.get("/requests", getAllFriendRequest);
router.get("/", getAllFriend);

export default router;

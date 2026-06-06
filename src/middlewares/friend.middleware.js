import FriendShip from "../models/friendShip.model.js";
import Conversation from "../models/conversation.model.js";

import { normalizeFriendPair } from "../services/friend.service.js";
import ApiError from "../utils/ApiError.js";

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id;
    const recipientId = req.body?.recipientId ?? null;
    const memberIds = req.body?.memberIds ?? [];

    const inValidGroup = memberIds.length === 0;

    if (!recipientId && inValidGroup) {
      throw new ApiError(400, "Missing recipientId or members Id");
    }

    if (recipientId) {
      const [userA, userB] = normalizeFriendPair(me, recipientId);

      const isFriend = await FriendShip.findOne({ userA, userB });

      if (!isFriend)
        throw new ApiError(403, "You two must be friend before send messages");

      return next();
    }

    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = normalizeFriendPair(me, memberId);
      const friend = await FriendShip.findOne({ userA, userB });
      return friend ? null : memberId;
    });

    const result = await Promise.all(friendChecks);
    const notFriends = result.filter(Boolean);
    const invalidGroup = notFriends.length > 0;

    if (invalidGroup)
      throw new ApiError(
        403,
        "Only friends can be join group",
        notFriends,
        "notFriend",
      );

    next();
  } catch (error) {
    next(error);
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new ApiError(404, "Conversation not found");

    // check if sender is member in group
    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (!isMember) throw new ApiError(403, "You are not member in this group");

    req.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

import Friend from "../models/friendShip.model.js";
import { normalizeFriendPair } from "../services/friend.service.js";
import ApiError from "../utils/ApiError.js";

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id;
    const recipientId = req.body?.recipientId ?? null;

    if (!recipientId) {
      throw new ApiError(400, "Missing recipientId");
    } else {
      const [userA, userB] = normalizeFriendPair(me, recipientId);

      const isFriend = await Friend.findOne({ userA, userB });

      if (!isFriend)
        throw new ApiError(403, "You two must be friend before send messages");

      return next();
    }

    // todo : Group chat
  } catch (error) {
    next(error);
  }
};

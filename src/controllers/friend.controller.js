import {
  sendFriendAddRequest,
  acceptFriendAddRequest,
  declineFriendRequest,
  getAllFriends,
  getAllFriendRequests,
} from "../services/friend.service.js";

export const sendAddFriendRequest = async (req, res, next) => {
  try {
    const request = await sendFriendAddRequest({
      ...req.body,
      user: req.user,
    });

    return res
      .status(201)
      .json({ message: "Request send successful", request });
  } catch (error) {
    next(error);
  }
};

export const acceptAddFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const currUserId = req.user._id;

    const { newFriend } = await acceptFriendAddRequest({
      requestId,
      currUserId,
    });

    return res.status(200).json({
      message: "Friend request accepted",
      newFriend,
    });
  } catch (error) {
    next(error);
  }
};

export const declineAddFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const currUserId = req.user._id;

    await declineFriendRequest({ requestId, currUserId });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getAllFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { send, received } = await getAllFriendRequests({ userId });

    return res.status(200).json({
      send,
      received,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFriend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friends, isEmptyFriendShips } = await getAllFriends({ userId });

    if (isEmptyFriendShips) return res.status(200).json({ friends: [] });
    else return res.status(200).json({ friends: friends });
  } catch (error) {
    next(error);
  }
};

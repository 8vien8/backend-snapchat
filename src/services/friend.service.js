import FriendRequest from "../models/friendRequest.model.js";
import FriendShip from "../models/friendShip.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Normalize friendship pair
 * smaller id => userA
 * larger id => userB
 */
const normalizeFriendPair = (id1, id2) => {
  return id1.toString() < id2.toString() ? [id1, id2] : [id2, id1];
};

/**
 * Send friend request
 */
export const sendFriendAddRequest = async (data) => {
  const { to, message, user } = data;

  const from = user._id;

  // prevent self request
  if (to.toString() === from.toString()) {
    throw new ApiError(400, "Cannot send friend request to yourself");
  }

  // check user exists
  const isUserExist = await User.exists({ _id: to });

  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  // normalize friendship pair
  const [userA, userB] = normalizeFriendPair(from, to);

  // check friendship + existing request
  const [alreadyFriend, existingRequest] = await Promise.all([
    FriendShip.findOne({
      userA,
      userB,
    }),

    FriendRequest.findOne({
      $or: [
        { from, to },
        {
          from: to,
          to: from,
        },
      ],
    }),
  ]);

  if (alreadyFriend) {
    throw new ApiError(400, "Users are already friends");
  }

  if (existingRequest) {
    throw new ApiError(400, "Friend request already exists");
  }

  // create request
  const request = await FriendRequest.create({
    from,
    to,
    message,
  });

  return request;
};

/**
 * Accept friend request
 */
export const acceptFriendAddRequest = async (data) => {
  const { requestId, currUserId } = data;

  // find request
  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Friend request not found");
  }

  // permission check
  const hasAcceptPermission = request.to.toString() === currUserId.toString();

  if (!hasAcceptPermission) {
    throw new ApiError(403, "You don't have permission to accept this request");
  }

  // normalize friendship pair
  const [userA, userB] = normalizeFriendPair(request.from, request.to);

  // check existing friendship
  const existingFriendship = await FriendShip.findOne({
    userA,
    userB,
  });

  if (existingFriendship) {
    // clean invalid request
    await FriendRequest.findByIdAndDelete(requestId);

    throw new ApiError(400, "Users are already friends");
  }

  // create friendship
  await FriendShip.create({
    userA,
    userB,
  });

  // delete request after accept
  await FriendRequest.findByIdAndDelete(requestId);

  // sender info
  const sender = await User.findById(request.from)
    .select("_id displayName avatarUrl")
    .lean();

  return {
    newFriend: {
      _id: sender?._id,
      displayName: sender?.displayName,
      avatarUrl: sender?.avatarUrl,
    },
  };
};
/**
 * Decline friend request
 */
export const declineFriendRequest = async (data) => {
  const { requestId, currUserId } = data;

  const request = await FriendRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Can not found add friend request");

  const hasDeclinePermission = request.to.toString() === currUserId.toString();

  if (!hasDeclinePermission)
    throw new ApiError(
      403,
      "You don't have permission to decline this request",
    );

  await FriendRequest.findByIdAndDelete(requestId);
};
/**
 * Get all friend
 */
export const getAllFriends = async (data) => {
  const { userId } = data;

  const friendships = await FriendShip.find({
    $or: [
      {
        userA: userId,
      },
      {
        userB: userId,
      },
    ],
  })
    .populate("userA", "_id displayName avatarUrl")
    .populate("userB", "_id displayName avatarUrl")
    .lean();

  const isEmptyFriendShips = !friendships.length;

  // check who is you in friendships then return your friends
  const userIdStr = userId.toString();

  const friends = friendships.map((f) =>
    f.userA._id.toString() === userIdStr ? f.userB : f.userA,
  );

  return {
    friends,
    isEmptyFriendShips,
  };
};
/**
 * Get all friend request
 */
export const getAllFriendRequests = async (data) => {
  const { userId } = data;
  const populateField = "_id username displayName avatarUrl";

  const [send, received] = await Promise.all([
    FriendRequest.find({ from: userId }).populate("to", populateField).lean(),
    FriendRequest.find({ to: userId }).populate("from", populateField).lean(),
  ]);

  return {
    send,
    received,
  };
};

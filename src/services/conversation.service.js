import ApiError from "../utils/ApiError.js";
import Conversation from "../models/conversation.model.js";
import Messsage from "../models/message.model.js";
import { io } from "../socket/index.js";

export const creatConversations = async (data) => {
  const { type, name, memberIds, userId } = data;

  const invalidConversation =
    !type ||
    (type === "group" && !name) ||
    !memberIds ||
    !Array.isArray(memberIds) ||
    memberIds.length === 0;

  if (invalidConversation)
    throw new ApiError(400, "Missing Group name and members");

  let conversation;

  //   ------------DIRECT----------------
  if (type === "direct") {
    const participantId = memberIds[0];

    conversation = await Conversation.findOne({
      type: "direct",
      "participants.userId": { $all: [userId, participantId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        type: "direct",
        participants: [{ userId }, { userId: participantId }],
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }
  }

  //   ------------GROUP----------------
  if (type === "group") {
    conversation = new Conversation({
      type: "group",
      participants: [
        { userId },
        ...memberIds.map((id) => ({
          userId: id,
        })),
      ],
      group: {
        name,
        createdBy: userId,
      },
      lastMessageAt: new Date(),
    });

    await conversation.save();
  }

  if (!conversation) throw new ApiError(400, "Conversation type is invalid");

  const populateField = "displayName avatarUrl";
  await conversation.populate([
    {
      path: "participants.userId",
      select: populateField,
    },
    {
      path: "seenBy",
      select: populateField,
    },
    {
      path: "lastMessage.senderId",
      select: populateField,
    },
  ]);

  return conversation;
};

export const getConversations = async (data) => {
  const { userId } = data;

  const selectedField = "displayName avatarUrl";
  let conversations = await Conversation.find({
    "participants.userId": userId,
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .populate({
      path: "participants.userId",
      select: selectedField,
    })
    .populate({
      path: "lastMessage.senderId",
      select: selectedField,
    })
    .populate({
      path: "seenBy",
      select: selectedField,
    });

  const formatted = conversations.map((conversation) => {
    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    return {
      ...conversation.toObject(), // convert to Object instead of Mongoose document
      unreadCounts: conversation.unreadCounts || [],
      participants,
    };
  });

  return { newConversations: formatted };
};

export const getMessages = async (data) => {
  // pagination - limit + cursor(createdDate)
  const { conversationId, limit, cursor } = data;

  const query = { conversationId };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) }; // cursor is String -> Date
  }

  let messages = await Messsage.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit) + 1); // +1 to check is there any next page

  let nextCursor = null;

  const messageLength = messages.length;
  if (messageLength > Number(limit)) {
    const nexMessage = messages[messageLength - 1];
    nextCursor = nexMessage.createdAt.toISOString();
    messages.pop();
  }

  messages = messages.reverse(); // latest message must be always bottom

  return {
    nextCursor,
    messages,
  };
};

export const markAsSeenMessages = async (data) => {
  const { conversationId, userId } = data;

  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const lastMes = conversation.lastMessage;

  const updated = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $addToSet: { seenBy: userId },
      $set: { [`unreadCounts.${userId}`]: 0 },
    },
    { new: true },
  )
    .populate({
      path: "participants.userId",
      select: "displayName avatarUrl",
    })
    .populate({
      path: "lastMessage.senderId",
      select: "displayName avatarUrl",
    })
    .populate({
      path: "seenBy",
      select: "displayName avatarUrl",
    });

  if (!updated) throw new ApiError(404, "Conversation not found");

  const participants = (updated.participants || []).map((p) => ({
    _id: p.userId?._id,
    displayName: p.userId?.displayName,
    avatarUrl: p.userId?.avatarUrl ?? null,
    joinedAt: p.joinedAt,
  }));

  const formattedConvo = {
    ...updated.toObject(),
    participants,
  };

  io.to(conversationId).emit("read-message", {
    conversation: formattedConvo,
    lastMessage: formattedConvo.lastMessage
      ? {
          _id: formattedConvo.lastMessage._id,
          content: formattedConvo.lastMessage.content,
          createdAt: formattedConvo.lastMessage.createdAt,
          sender: formattedConvo.lastMessage.senderId
            ? {
                _id: formattedConvo.lastMessage.senderId._id,
                displayName: formattedConvo.lastMessage.senderId.displayName || "",
                avatarUrl: formattedConvo.lastMessage.senderId.avatarUrl || null,
              }
            : null,
        }
      : null,
  });

  const seenBy = formattedConvo.seenBy || [];
  const myUnreadCount = formattedConvo.unreadCounts?.[userId] || 0;

  return { lastMes, seenBy, myUnreadCount };
};

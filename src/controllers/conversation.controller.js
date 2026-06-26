import {
  getMessages,
  getConversations,
  creatConversations,
  markAsSeenMessages,
} from "../services/conversation.service.js";
import Conversation from "../models/conversation.model.js";

export const creatConversation = async (req, res, next) => {
  try {
    console.log(req.body);
    const conversation = await creatConversations({
      ...req.body,
      userId: req.user._id,
    });
    return res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { newConversations } = await getConversations({
      userId: userId,
    });

    return res.status(200).json({ conversations: newConversations });
  } catch (error) {
    next(error);
  }
};

export const getMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const { messages, nextCursor } = await getMessages({
      conversationId,
      limit,
      cursor,
    });

    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    next(error);
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      {
        "participants.userId": userId,
      },
      { _id: 1 }, // Only take _id field in response
    );

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("Error when fetch conversations", error);
    return [];
  }
};

export const markAsSeenMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { lastMes, myUnreadCount, seenBy } = await markAsSeenMessages({
      conversationId,
      userId,
    });

    if (!lastMes) return res.status(200);

    if (lastMes.senderId.toString() === userId) return res.status(200);

    return res.status(200).json({
      message: "Mark as read",
      seenBy: seenBy,
      myUnreadCount: myUnreadCount,
    });
  } catch (error) {
    next(error);
  }
};

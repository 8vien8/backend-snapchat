import {
  getMessages,
  getConversations,
  creatConversations,
} from "../services/conversation.service.js";

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

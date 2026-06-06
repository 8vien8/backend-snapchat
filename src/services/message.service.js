import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import { udpateConversationAfterUpdate } from "../utils/message.helper.js";

export const sendDirectMessages = async (data) => {
  const { recipientId, content, conversationId, senderId } = data;

  let conversation;

  if (!content) throw new ApiError(400, "Missing content");

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
  } else {
    conversation = await Conversation.create({
      type: "direct",
      participants: [
        { userId: senderId, joinedAt: new Date() },
        { userId: recipientId, joinedAt: new Date() },
      ],
      lastMessageAt: new Date(),
      unreadCounts: new Map(),
    });
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId,
    content,
  });

  udpateConversationAfterUpdate(conversation, message, senderId);

  await conversation.save();

  return message;
};

export const sendGroupMessages = async (data) => {
  const { conversationId, content, senderId, conversation } = data;

  if (!content) throw new ApiError(400, "Missing content");

  const message = await Message.create({
    conversationId,
    senderId,
    content,
  });

  udpateConversationAfterUpdate(conversation, message, senderId);
  await conversation.save();

  return { message };
};

import {
  sendDirectMessages,
  sendGroupMessages,
} from "../services/message.service.js";

export const sendDirectMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const message = await sendDirectMessages({
      ...req.body,
      senderId: senderId,
    });

    return res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

export const sendGroupMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const conversation = req.conversation; // middleware

    const { message } = await sendGroupMessages({
      ...req.body,
      senderId: senderId,
      conversation: conversation,
    });

    return res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

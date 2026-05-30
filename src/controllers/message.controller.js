import { sendDirectMessages } from "../services/message.service.js";

export const sendDirectMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    console.log(senderId);
    const message = await sendDirectMessages({
      ...req.body,
      senderId: senderId,
    });

    return res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

export const sendGroupMessage = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

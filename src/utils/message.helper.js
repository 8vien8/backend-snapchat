export const udpateConversationAfterUpdate = (
  conversation,
  message,
  senderId,
) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt, //add new field
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevUnreadCount = conversation.unreadCounts.get(memberId) || 0;

    conversation.unreadCounts.set(memberId, isSender ? 0 : prevUnreadCount + 1);
  });
};

export const emitNewMessage = (io, conversation, message) => {
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: conversation.unreadCounts,
  });
};

import { decryptMessage } from "./crypto";

export const normalizeMessage = (msg: any) => {
  let content = msg.content;
  if (msg.type === "text" && msg.content) {
    try {
      content = decryptMessage(msg.content);
    } catch (e) {
      console.warn('Could not decrypt old message, showing raw content:', msg.content);
      content = msg.content;
    }
  }

  return {
    id: msg.id,
    matchId: msg.match_id,
    senderId: msg.sender_id,
    content,
    type: msg.type,
    timestamp: msg.created_at,
    isRead: msg.is_read ?? false,
    reply_to: msg.reply_to,
    reply_content: msg.reply_content,
  };
};
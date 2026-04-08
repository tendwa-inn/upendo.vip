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
    ...msg,
    content,
    timestamp: msg.created_at,
  };
};
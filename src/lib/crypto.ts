import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback-dev-key";

// Encrypt
export const encryptMessage = (message: string): string => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

// Decrypt (NO base64 fallback ❌)
export const decryptMessage = (encryptedMessage: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      console.warn("Failed to decrypt:", encryptedMessage);
      return "[Decryption failed]";
    }

    return decrypted;
  } catch (error) {
    console.error("Decrypt error:", error);
    return "[Error]";
  }
};
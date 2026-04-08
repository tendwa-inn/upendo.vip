// This is a mock encryption/decryption for demonstration purposes only.
// In a real application, you would use a robust, well-vetted cryptography library.

export const encryptMessage = (message: string): string => {
  // Simple Base64 encoding to simulate encryption
  try {
    return btoa(message);
  } catch (error) {
    console.error('Encryption failed:', error);
    return message; // Return original message on failure
  }
};

export const decryptMessage = (encryptedMessage: string): string => {
  // Simple Base64 decoding to simulate decryption
  try {
    return atob(encryptedMessage);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedMessage; // Return encrypted message on failure
  }
};

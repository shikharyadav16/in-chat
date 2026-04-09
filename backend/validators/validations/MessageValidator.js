const response = require("../Response");

class MessageValidator {
    static validateMessage(message) {
        if (typeof message.encryptionPayload.cipherText !== 'string' || message.encryptionPayload.cipherText.trim() === '' ) {
            return response(false, 'Message must be a non-empty string.');
        }

        if (message.roomId && (typeof message.roomId !== 'string' || message.roomId.trim() === '')) {
            return response(false, 'Room ID must be a non-empty string if provided.');
        }

        if (message.senderId && (typeof message.senderId !== 'string' || message.senderId.trim() === '')) {
            return response(false, 'Sender ID must be a non-empty string if provided.');
        }

        return response(true);
    }
}

module.exports = MessageValidator;

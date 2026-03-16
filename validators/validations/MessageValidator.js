import { MessageValidationError } from "../Error";

class MessageValidator {
    static validateMessage(message) {
        if (typeof message.encryptionPayload.cipherText !== 'string' || message.encryptionPayload.cipherText.trim() === '' ) {
            throw new MessageValidationError('Message must be a non-empty string.');
        }

        if (message.roomId && (typeof message.roomId !== 'string' || message.roomId.trim() === '')) {
            throw new RoomValidationError('Room ID must be a non-empty string if provided.');
        }

        if (message.senderId && (typeof message.senderId !== 'string' || message.senderId.trim() === '')) {
            throw new MessageValidationError('Sender ID must be a non-empty string if provided.');
        }

        return true;
    }
}

export default MessageValidator;

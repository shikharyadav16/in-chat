export function getMessageObject({ text, roomId, type = "text" }) {
    return {
        message: text,
        roomId,
        type
    }
}
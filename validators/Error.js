class UserValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserValidationError";
    }
}

class ReactionValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ReactionValidationError";
    }
}

class RoomValidationError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = "RoomValidationError";
    }
}

class MessageValidationError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = "MessageValidationError";
    }
}

export { UserValidationError, ReactionValidationError, RoomValidationError, MessageValidationError };
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

class RoomValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "RoomValidationError";
    }
}

class MessageValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "MessageValidationError";
    }
}

module.exports =  { UserValidationError, ReactionValidationError, RoomValidationError, MessageValidationError };
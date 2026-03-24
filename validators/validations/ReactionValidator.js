const response = require("../Error");

class ReactionValidator {
    static validateReaction(reaction) {
        if (!reaction.messageId || typeof reaction.messageId !== 'string') {
            return response(false, 'Message ID is required and must be a string.');
        }
    return response(true);
    }
}

module.exports = ReactionValidator;

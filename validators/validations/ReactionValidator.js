const { ReactionValidationError } = require("../Error");

class ReactionValidator {
    static validateReaction(reaction) {
        if (!reaction.messageId || typeof reaction.messageId !== 'string') {
            throw new ReactionValidationError('Message ID is required and must be a string.');
        }
    return true;
    }
}

module.exports = ReactionValidator;

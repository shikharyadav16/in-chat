const response = require("../Error");

class RoomValidator {
    static validateRoomData(room) {
        if (!room.name || typeof room.name !== 'string' || room.name.trim() === '' || room.name.length < 3 || room.name.length > 50) {
            return response(false, 'Room name is required and must be a string between 3 and 50 characters.');
        }

        if (room.description && (typeof room.description !== 'string' || room.description.length > 200)) {
            return response(false, 'Room description must be a string with a maximum length of 200 characters.');
        }

        return response(true);
    }

    static validateRoomName(name) {
        if (!name || typeof name !== 'string' || name.trim() === '' || name.length < 3 || name.length > 50) {
            return response(false, 'Room name is required and must be a string between 3 and 50 characters.');
        }
        return response(true);
    }

    static validateRoomDescription(description) {
        if (description && (typeof description !== 'string' || description.length > 200)) {
            return response(false, 'Room description must be a string with a maximum length of 200 characters.');
        } 
        return response(true);
    }
}

module.exports = RoomValidator;
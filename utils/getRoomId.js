const getRoomId = ({ userId, targetId }) => {
    return userId > targetId
        ? "room_" + userId.slice(3) + targetId.slice(3)
        : "room_" + targetId.slice(3) + userId.slice(3);
};

module.exports = getRoomId;
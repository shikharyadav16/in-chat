const getGroupRoomId = () => {
    return "group_" + Date.now()
};

module.exports = getGroupRoomId;
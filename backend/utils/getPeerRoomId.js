function getPeerRoomId(userId1, userId2) {
    const sortedIds = [userId1.split("_")[1], userId2.split("_")[1]].sort();
    return `peer_${sortedIds[0]}_${sortedIds[1]}`;
}

module.exports = getPeerRoomId;
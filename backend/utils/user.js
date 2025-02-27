const users = [];

// Join user to chat
function userJoin(id, username, room, host, presenter) {
    const user = { id, username, room, host, presenter };
    users.push(user);
    return user;
}

// Get users in room
function getUsers(room) {
    return users.filter(user => user.room === room);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

module.exports = {
    userJoin,
    getUsers,
    userLeave
};

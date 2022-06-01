const users = [];

function addUser({id, name, room}) {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existing = users.find((user) => (user.name === name && user.room === room))

    if(existing) {
        return { error : 'username is taken' };
    }
    
    const user = {id, name, room};
    users.push(user);
    return { user };
}

function rmUser(id) {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

function getUser(id) {
    return users.find((user) => (user.id === id));
}

function getUserInRoom(room) {
    return users.filter((user) => (user.room === room));
}

module.exports = {addUser, rmUser, getUser, getUserInRoom};
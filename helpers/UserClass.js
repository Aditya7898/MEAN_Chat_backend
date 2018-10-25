class User {
  constructor() {
    this.globalArray = [];
  }

  EnterRoom(id, name, room) {
    const user = { id: id, name: name, room: room };
    this.globalArray.push(user);
    return user;
  }

  GetUserId(id) {
    // !! this will return  an array
    const socketId = this.globalArray.filter(userId => userId.id === id)[0];
    return socketId;
  }

  RemoveUser(id) {
    const user = this.GetUserId(id);
    if (user) {
      this.globalArray = this.globalArray.filter(userId => userId.id !== id);
    }
    return user;
  }

  GetList(room) {
    const roomName = this.globalArray.filter(user => user.room == room);
    const names = roomName.map(user => user.name);
    return names;
  }
}

module.exports = { User };

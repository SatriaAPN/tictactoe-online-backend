const { nanoid } = require('nanoid');

class roomsData {
  constructor() {
    if (typeof roomsData.INSTANCE === 'object') {
      return roomsData.INSTANCE;
    }
    
    this.rooms = {};
    roomsData.INSTANCE = this;
  }
  
  addRoom(roomName, roomType, playerData) {
    const data =  {
      roomPlaying: false,
      roomType: roomType || 'public',
      roomUuid: nanoid(10),
      roomName: roomName,
      players: [
        {
          token: playerData.token,
          username: playerData.username,
          uuid: playerData.uuid,
          ready: false
        }
      ],
      creator: playerData.token
    };

    this.rooms[data.roomUuid] = data;
  }

  getRoom(uuid) {
    return this.rooms[uuid];
  }

  deleteRoom(roomUuid) {
    delete this.rooms[roomUuid];
  }

  joinRoom(roomUuid, playerData) {
    this.rooms[roomUuid].players.push(playerData);
  }

  findPlayer(roomUuid, playerUuid) {
    // find the player that left in the room's players array
    const playerIndex = this.rooms[roomUuid].players.map(as=>as.uuid).indexOf(playerUuid);

    // check if the player exist in the room's players array
    if(playerIndex === -1) throw new Error('player did not found');

    return playerIndex;
  }

  leftRoom(roomUuid, playerUuid) {
    const playerIndex = this.findPlayer(roomUuid, playerUuid);
    // remove the player that left from the room's players array
    this.rooms[roomUuid].players.splice(playerIndex, 1);
  }

  getAllRooms() {
    return Object.values(this.rooms);
  }

  playerReady(roomUuid, playerUuid, playerReadyStatus) {
    const playerIndex =  this.findPlayer(roomUuid, playerUuid);

    this.rooms[roomUuid].players[playerIndex].ready = playerReadyStatus;
  }

  setRoomPlaying(roomUuid, roomStatus) {
    this.rooms[roomUuid].roomPlaying = roomStatus;
  }
}

module.exports = roomsData;
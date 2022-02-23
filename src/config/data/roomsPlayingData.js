class RoomsPlayingData {
  constructor() {
    if (typeof RoomsPlayingData.INSTANCE === 'object') {
      return RoomsPlayingData.INSTANCE;
    }
    
    this.roomsPlaying = {};
    RoomsPlayingData.INSTANCE = this;
  }

  createRoomPlaying(roomData) {
    this.roomsPlaying[roomData.roomUuid] = roomData;
  }

  getRoomPlaying(roomUuid) {
    return this.roomsPlaying[roomUuid];
  }

  setPlayerMove(roomUuid, moveIndex, playerToken) {
    this.roomsPlaying[roomUuid].tictactoeArray[moveIndex[0]][moveIndex[1]] = playerToken;
  }

  setPlayerTurn(roomUuid, playerToken) {
    this.roomsPlaying[roomUuid].playerTurn = playerToken; 
  }

  deleteRoomPlaying(roomUuid) {
    delete this.roomsPlaying[roomUuid];
  }
}

module.exports = RoomsPlayingData;
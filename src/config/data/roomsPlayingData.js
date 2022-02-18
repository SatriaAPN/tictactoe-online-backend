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
}

module.exports = RoomsPlayingData;
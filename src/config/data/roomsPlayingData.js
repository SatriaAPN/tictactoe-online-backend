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

    this.checkIfPLayerWin(roomUuid, playerToken);
  }

  setPlayerTurn(roomUuid, playerToken) {
    this.roomsPlaying[roomUuid].playerTurn = playerToken; 
  }

  deleteRoomPlaying(roomUuid) {
    delete this.roomsPlaying[roomUuid];
  }

  checkIfPLayerWin(roomUuid, playerToken) {
    const roomPlaying = this.getRoomPlaying(roomUuid);
    const tictactoeArray = roomPlaying.tictactoeArray;
    
    // check column
    // . x .
    // . x .
    // . x .
    //
    for(let i=0; i<3; i++) {
      if(
        tictactoeArray[0][i] === playerToken
        && tictactoeArray[1][i] === playerToken
        && tictactoeArray[2][i] === playerToken
      ) {
        this.setPlayerWin(roomUuid, playerToken);
        this.setWinIndex(roomUuid, [[0, i], [1, i], [2, i]]);
      }
    }

    // check row
    // . . .
    // x x x
    // . . .
    //
    for(let i=0; i<3; i++) {
      if(
        tictactoeArray[i][0] === playerToken
        && tictactoeArray[i][1] === playerToken
        && tictactoeArray[i][2] === playerToken
      ) {
        this.setPlayerWin(roomUuid, playerToken);
        this.setWinIndex(roomUuid, [[i, 0], [i, 1], [i, 2]]);
      }
    }

    // check diagonal
    // x . .
    // . x .
    // . . x
    //
    if(
      tictactoeArray[0][0] === playerToken
      && tictactoeArray[1][1] === playerToken
      && tictactoeArray[2][2] === playerToken
    ) {
      this.setPlayerWin(roomUuid, playerToken);
      this.setWinIndex(roomUuid, [[0, 0], [1, 1], [2, 2]]);
    }

    // check anti-diagonal
    // . . x
    // . x .
    // x . .
    //
    if(
      tictactoeArray[0][2] === playerToken
      && tictactoeArray[1][1] === playerToken
      && tictactoeArray[2][0] === playerToken
    ) {
      this.setPlayerWin(roomUuid, playerToken);
      this.setWinIndex(roomUuid, [[0, 2], [1, 1], [2, 0]]);
    }

  }

  setPlayerWin(roomUuid, playerToken) {
    this.roomsPlaying[roomUuid].playerWin = playerToken;
  }

  checkIfPlayerHasWin(roomUuid) {
    return this.roomsPlaying[roomUuid].playerWin != null;
  }

  setWinIndex(roomUuid, winIndex) {
    this.roomsPlaying[roomUuid].winIndex = [winIndex];
  }
}

module.exports = RoomsPlayingData;
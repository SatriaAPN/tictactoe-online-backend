const RoomsPlayingData = require('../data/roomsPlayingData');
const roomsPlayingData = new RoomsPlayingData();

const checkIfPlayerWin = async(userToken, roomPlayingIndex) => {
  const roomPlaying = roomsPlayingArray[roomPlayingIndex];
  const tictactoeArray = roomPlaying.tictactoeArray;

  for(let i=0; i<3; i++) {
    let rowWin = [];
    let countRow = 0;
    for(let j=0; j<3; j++) {

    }
  }

  // check row
  for(let i=0; i<3; i++) {
    let rowWin = [];
    let countColumn = 0;
    for(let j=0; j<3; j++) {
      if(tictactoeArray[i][j] === userToken) {
        countColumn++;
        rowWin.push([[i, j]]);
      }
    }
    if(countRow === 3) {
      return roomPlaying.winIndex = rowWin;
    };
  }
  if(
    tictactoeArray[0][0] === userToken
    && tictactoeArray[0][1] === userToken
    && tictactoeArray[0][2] === userToken
    ) {

    }

  // check column

  // check diagonal
}

module.exports = checkIfPlayerWin;
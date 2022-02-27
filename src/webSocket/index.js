
const RoomsData = require('../config/data/roomsData');
const roomsData = new RoomsData();
const RoomsPlayingData = require('../config/data/roomsPlayingData');
const roomsPlayingData = new RoomsPlayingData();
const jwtFunction = require('../config/lib/jwtFunction');

const { server } = require('../config/config');
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

const { nanoid } = require('nanoid');

io.on('connection', (socket) => {
  // if(playersArray.indexOf(socket) === -1){
  //   console.log(playersArray.indexOf(socket))
  //   console.log('a user connected');
  //   playersArray.push(socket);
  // }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('createRoom', async (msg) => {
    console.log('a room created');
    const body = {
      jwtToken: msg.Authorization, // Header jwt {token}
      roomType: msg.roomType,
      roomName: msg.roomName
    }

    const user = await jwtFunction.verifJwtToken(body.jwtToken); // {username, uuid}
console.log(user)
    const data =  {
      roomPlaying: false,
      roomType: body.roomType,
      roomUuid: nanoid(10),
      roomName: body.roomName,
      players: [
        {
          token: user.token,
          username: user.username,
          uuid: user.uuid,
          ready: false
        }
      ],
      creator: user.token 
    };

    roomsData.addRoom(data);

    io.emit('createRoom', data);
  })

  socket.on('joinRoom', async (msg) => {
    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid
    };

    const user = await jwtFunction.verifJwtToken(body.jwtToken); // {username, uuid}

    // if(!roomsObject[body.roomUuid]) throw new Error('room did not found');

    // if(roomsObject[body.roomUuid].players.length >= 2) throw new Error('the room is full');

    if(!roomsData.getRoom(body.roomUuid)) throw new Error('room did not found');

    if(roomsData.getRoom(body.roomUuid).players.length >= 2) throw new Error('the room is full');

    const player = {
      token: user.token,
      username: user.username,
      uuid: user.uuid,
      ready: false
    }

    roomsData.joinRoom(body.roomUuid, player)

    const result = {
      data: roomsData.getRoom(body.roomUuid)
    }

    io.emit(`joinRoom/${body.roomUuid}`, result);
  })

  socket.on('leaveRoom', async(msg) => {
    console.log('a player has leave a room ');

    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid
    };

    const user = await jwtFunction.verifJwtToken(body.jwtToken); // {username, uuid}
    
    // // find the room in the rooms array by uuid
    // const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(body.roomUuid);

    // // check if the room is found
    // if(roomIndex === -1) throw new Error('room did not found');

    // if(!roomsObject[body.roomUuid]) {
    //   throw new Error('room did not found');
    // }

    if(!roomsData.getRoom(body.roomUuid)) throw new Error('room did not found');

    // find the player that left in the room's players array
    const playerIndex = roomsData.getRoom(body.roomUuid).players.map(as=>as.uuid).indexOf(user.uuid);

    // check if the player exist in the room's players array
    if(playerIndex === -1) throw new Error('player did not found');

    // remove the player that left from the room's players array
    // roomsObject[roomUuid].players.splice(playerIndex, 1);
    roomsData.leftRoom(body.roomUuid, user.uuid)

    // check if the room's players is empty or not
    if (roomsData.getRoom(body.roomUuid).players.length !== 0){
      const data = {
        data: {
          players: roomsData.getRoom(body.roomUuid).players
        }
      };

      io.emit(`room/${body.roomUuid}/playerLeave`, data);
    } else {
      // delete the empty room from the roomsArray
      roomsData.deleteRoom(body.roomUuid)

      const roomsArray = roomsData.getAllRooms();

      const data = {
        data: {
          roomsArray
        }
      }

      // emit the message to listener in websocket
      io.emit('deleteRoom', data);
    }
  })

  socket.on('playerReady', async(msg) => {
    console.log('a player is ready ');

    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid,
      userReady: msg.ready
    };

    const user = await jwtFunction.verifJwtToken(body.jwtToken); // {username, uuid}
    
    if(!roomsData.getRoom(body.roomUuid)) throw new Error('room did not found');

    // find the player that left in the room's players array
    const playerIndex = roomsData.findPlayer(body.roomUuid, user.uuid);
    
    // check if the player exist in the room's players array
    if(playerIndex === -1) throw new Error('player did not found');

    // update the player's ready status
    roomsData.playerReady(body.roomUuid, user.uuid, body.userReady)

    // check if total players are 2 
    if(roomsData.getRoom(body.roomUuid).players.length === 2){
      // check if all players are ready
      let allReady = [];
      for(let i=0; i<2; i++) {
        allReady.push(roomsData.getRoom(body.roomUuid).players[i].ready);
      }
      // if all players ready
      if (allReady[0] && allReady[1]) {
        // change roomPLaying status to true
        roomsData.setRoomPlaying(body.roomUuid, true);

        // create new data in roomPLaying array
        roomPlayingData = {
          roomUuid: body.roomUuid,
          tictactoeArray: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
          ],
          playerWin: null,
          playerTurn: roomsData.getRoom(body.roomUuid).players[0].token,
          winIndex: []
        }

        roomsPlayingData.createRoomPlaying(roomPlayingData);
      } else {
        roomsData.setRoomPlaying(body.roomUuid, false);
      }
    } else {
      roomsData.setRoomPlaying(body.roomUuid, false);
    }

    // emit the new array's data to the frontend
    io.emit( `room/${body.roomUuid}/playerReady`, roomsData.getRoom(body.roomUuid));
  })

  socket.on('playerMove', async(msg) => {
    console.log('a player is moving ');

    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid,
      userMove: msg.moveIndex //[1,1]
    };

    // const user = await jwtFunction(body.jwtFunction); // {username, uuid}
    
    // find and check if the room is found
    if(!roomsData.getRoom(body.roomUuid)) throw new Error('room did not found');

    // find and check if the room playing is found
    if(!roomsPlayingData.getRoomPlaying(body.roomUuid)) throw new Error('room playing did not found');

    // check if the tictactoe index has been occupied by another player
    if(roomsPlayingData.getRoomPlaying(body.roomUuid).tictactoeArray[body.userMove[0]][body.userMove[1]] != 0) {
      throw new Error('the index space has been occupied by another player');
    }

    // insert the player move index into the roomPlayingArray
    roomsPlayingData.setPlayerMove(body.roomUuid, [[body.userMove[0]], [body.userMove[1]]], body.jwtToken.split(' ')[2])
    

    // change the player turn
    if(roomsPlayingData.getRoomPlaying(body.roomUuid).playerTurn === roomsData.getRoom(body.roomUuid).players[0].token) {
      roomsPlayingData.setPlayerTurn(body.roomUuid, roomsData.getRoom(body.roomUuid).players[1].token);
    } else {
      roomsPlayingData.setPlayerTurn(body.roomUuid, roomsData.getRoom(body.roomUuid).players[0].token);
    }

    // check if any user win
    // checkIfPlayerWin(body.jwtFunction.split('')[2], roomPlayingIndex)
console.log(roomsPlayingData.getRoomPlaying(body.roomUuid))
    // emit the new array's data to the frontend
    io.emit( `room/${body.roomUuid}/playing/playerMove`, roomsPlayingData.getRoomPlaying(body.roomUuid));

    // if a player win, delete the roomPlaying from the array
    if(roomsPlayingData.getRoomPlaying(body.roomUuid).playerWin != null) {
      roomsPlayingData.deleteRoomPlaying(body.roomUuid);
    }
  })
});

module.exports = io;
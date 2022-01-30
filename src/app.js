const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken'); 
const secretKey = 'thisIsSecretKey';

// data array
let roomsArray = [];
let playersArray = [];
let roomsPlayingArray = []

// middleware
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(async (req, res, next) => {
  if(req.path === '/api/users/auth') return next();
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }

  const jwtToken = req.headers.authorization.split(' ')[2]; // Header jwt {token}

  req.user = await jwt.verify(jwtToken, secretKey);
  next();
})

app.get('/:roomId', (req, res, next) => {
  try{
    res.status(200).render(__dirname + '/index.ejs', { id: req.params.roomId });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.get('/users/test', (req, res, next) => {
  console.log(req.header);
  console.log(req.header('Authorization'));
})

app.post('/api/users/auth', async(req, res, next) => {
  try {
    console.log(req.body, req.params, req.query)
    const { username } = req.body;
    const uuid = nanoid(10);

    const jwtToken = await jwt.sign({ username, uuid }, secretKey);

    res.status(200).json({
      data: {
        accessToken: jwtToken
      }
    })
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.post('/users', (req, res, next) => {
  try {
    const { username } = req.body;

    if(playersArray.indexOf(username) != -1) {
      throw new Error('username has been used');
    }

    playersArray.push(username)
    res.status(200).json({ message: 'succes' });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.get('/api/rooms/:roomUuid/capacity', (req, res, next) => {
  try {
    const { roomUuid } = req.params;

    const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(roomUuid);

    if(roomIndex === -1) {
      throw new Error('room did not found');
    }

    if(roomsArray[roomIndex].players.length >= 2) {
      throw new Error('room is full');
    }

    res.status(200).json({ data: roomsArray[roomIndex] });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.get('/api/rooms/:roomUuid', (req, res, next) => {
  try {
    const { roomUuid } = req.params;

    const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(roomUuid);

    if(roomIndex === -1) {
      throw new Error('room did not found');
    }

    // if(roomsArray[roomIndex].players.length >= 2) {
    //   throw new Error('room is full');
    // }

    res.status(200).json({ data: roomsArray[roomIndex] });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.get('/api/rooms/join/:roomUuid', (req, res, next) => {
  try {
    const { roomUuid } = req.params;
    const { username, uuid } = req.user;
    

    const roomIndex = roomsArray.map(as=>as.uuid).indexOf(roomUuid);

    if(roomIndex === -1) {
      throw new Error('room did not found');
    }

    if(roomsArray[roomIndex].players.length >= 2) {
      throw new Error('room is full');
    }

    roomsArray[roomIndex].players.push({username, uuid});

    res.status(200).json({ successJoin: true });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.get('/api/rooms', (req, res, next) => {
  try {
    res.status(200).json({ data: { roomsArray } })
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

app.get('/api/rooms', (req, res, next) => {
  try {
    res.status(200).json({ data: { roomsArray } })
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

io.on('connection', (socket) => {
  if(playersArray.indexOf(socket) === -1){
    console.log(playersArray.indexOf(socket))
    console.log('a user connected');
    playersArray.push(socket);
  }

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

    const user = await verifJwtToken(body.jwtToken); // {username, uuid}

    const data =  {
      roomPlaying: false,
      roomType: body.roomType,
      roomUuid: nanoid(10),
      roomName: body.roomName,
      players: [
        {
          token: body.jwtToken,
          username: user.username,
          uuid: user.uuid,
          ready: false
        }
      ],
      creator: body.jwtToken.split(' ')[2]
    };
    console.log(data)
    roomsArray.push(data);

    console.log(data)
    if(data.roomType === 'public'){
      io.emit('createRoom', data);
    }
  })

  socket.on('joinRoom', async (msg) => {
    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid
    };

    const user = await verifJwtToken(body.jwtToken); // {username, uuid}

    const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(body.roomUuid);

    if(roomIndex === -1) throw new Error('room did not found');

    if(roomsArray[roomIndex].players.length >= 2) throw new Error('the room is full');

    const player = {
      token: body.jwtToken,
      username: user.username,
      uuid: user.uuid,
      ready: false
    }

    roomsArray[roomIndex].players.push(player);

    const data = {
      data: roomsArray[roomIndex]
    }

    io.emit(`joinRoom/${body.roomUuid}`, data);
  })

  socket.on('deleteRoom', (msg) => {
    const data =  {
      status: 'waiting',
      roomType: msg.roomType,
      roomId: nanoid(10),
      roomName: msg.roomName,
      players: [
        ...msg.players
      ]
    };

    roomsArray.push(msg.data);

    console.log(typeof msg)
    console.log(msg)
    if(data.roomtType === 'public'){
      io.emit(roomId, msg);
    }
  })

  socket.on('leaveRoom', async(msg) => {
    console.log('a player has leave a room ');

    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid
    };

    const user = await verifJwtToken(body.jwtToken); // {username, uuid}
    
    // find the room in the rooms array by uuid
    const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(body.roomUuid);

    // check if the room is found
    if(roomIndex === -1) throw new Error('room did not found');

    // find the player that left in the room's players array
    const playerIndex = roomsArray[roomIndex].players.map(as=>as.uuid).indexOf(user.uuid);

    // check if the player exist in the room's players array
    if(playerIndex === -1) throw new Error('player did not found');

    // remove the player that left from the room's players array
    roomsArray[roomIndex].players.splice(playerIndex, 1);

    // check if the room's players is empty or not
    if (roomsArray[roomIndex].players.length !== 0){
      const data = {
        data: {
          players: roomsArray[roomIndex].players
        }
      };

      io.emit(`room/${body.roomUuid}/playerLeave`, data);
    } else {
      // delete the empty room from the roomsArray
      roomsArray.splice(roomIndex, 1);

      const data = {
        data: {
          roomsArray: roomsArray
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

    const user = await verifJwtToken(body.jwtToken); // {username, uuid}
    
    // find the room in the rooms array by uuid
    const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(body.roomUuid);

    // check if the room is found
    if(roomIndex === -1) throw new Error('room did not found');

    // find the player that left in the room's players array
    const playerIndex = roomsArray[roomIndex].players.map(as=>as.uuid).indexOf(user.uuid);

    // check if the player exist in the room's players array
    if(playerIndex === -1) throw new Error('player did not found');

    // update the player's ready status
    roomsArray[roomIndex].players[playerIndex].ready = body.userReady;

    // check if total players are 2 
    if(roomsArray[roomIndex].players.length === 2){
      // check if all players are ready
      let allReady = [];
      for(let i=0; i<2; i++) {
        allReady.push(roomsArray[roomIndex].players[i].ready);
      }
      // if all players ready
      if (allReady[0] && allReady[1]) {
        // change roomPLaying status to true
        roomsArray[roomIndex].roomPlaying = true;
        // create new data in roomPLaying array
        roomsPlayingArray.push({
          roomUuid: body.roomUuid,
          tictactoeArray: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
          ],
          playerWin: null,
          playerTurn: roomsArray[roomIndex].players[0].token,
          winIndex: []
        })
      } else {
        roomsArray[roomIndex].roomPlaying = false;
      }
    } else {
      roomsArray[roomIndex].roomPlaying = false;
    }

    // emit the new array's data to the frontend
    io.emit( `room/${body.roomUuid}/playerReady`, roomsArray[roomIndex]);
  })

  socket.on('playerMove', async(msg) => {
    console.log('a player is moving ');

    const body = {
      jwtToken: msg.Authorization,
      roomUuid: msg.roomUuid,
      userMove: msg.moveIndex //[1,1]
    };

    console.log('body', body);

    const user = await verifJwtToken(body.jwtToken); // {username, uuid}
    
    // find the room in the rooms array by uuid
    const roomIndex = roomsArray.map(as=>as.roomUuid).indexOf(body.roomUuid);

    // check if the room is found
    if(roomIndex === -1) throw new Error('room did not found');

    // find the room data in the rooms playing array by uuid
    const roomPlayingIndex = roomsPlayingArray.map(as=>as.roomUuid).indexOf(body.roomUuid);

    if(roomPlayingIndex === -1) throw new Error('room playing did not found');

console.log('room: ', roomsPlayingArray[roomPlayingIndex]);

    // check if the tictactoe index has been occupied by another player
    if(roomsPlayingArray[roomPlayingIndex].tictactoeArray[body.userMove[0]][body.userMove[1]] != 0) {
      throw new Error('the index space has been occupied by another player');
    }

    // insert the player move index into the roomPlayingArray
    roomsPlayingArray[roomPlayingIndex].tictactoeArray[body.userMove[0]][body.userMove[1]] = body.jwtToken.split('')[2];

    // change the player turn
    if(roomsPlayingArray[roomPlayingIndex].playerTurn === roomsArray[roomIndex].players[0].token) {
      roomsPlayingArray[roomPlayingIndex].playerTurn = roomsArray[roomIndex].players[1].token;
    } else {
      roomsPlayingArray[roomPlayingIndex].playerTurn = roomsArray[roomIndex].players[0].token; 
    }

    // check if any user win
    // checkIfPlayerWin(body.jwtToken, roomPlayingIndex)

    // emit the new array's data to the frontend
    io.emit( `room/${body.roomUuid}/playing/playerMove`, roomsPlayingArray[roomPlayingIndex]);

    // if a player win, delete the roomPlaying from the array
    if(roomsPlayingArray[roomPlayingIndex].playerWin != null) {
      roomsPlayingArray.splice(roomPlayingIndex, 1);
    }
  })
})

const verifJwtToken = async(token) => {
  const jwtToken = token.split(' ')[2]; // Header jwt {token}

  return await jwt.verify(jwtToken, secretKey);
}

const checkIfPlayerWin = async(userToken, roomPlayingIndex) => {
  const roomPlaying = roomsPlayingArray[roomPlayingIndex];
  const tictactoeArray = roomPlaying.tictactoeArray;

  // check row
  for(let i=0; i<3; i++) {
    let rowWin = [];
    let countRow = 0;
    for(let j=0; j<3; j++) {
      if(tictactoeArray[i][j] === userToken) {
        countRow++;
        rowWin.push([[i, j]]);
      }
    }
    if(countRow === 3) {
      return roomPlaying.winIndex = rowWin;
    };
  }

  // check column
}

server.listen(3001, () => {
  console.log('server running at port 3001');
})
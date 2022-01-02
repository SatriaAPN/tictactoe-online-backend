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

// data array
let roomArray = [];
let playersArray = [];

// middleware
app.set('view engine', 'ejs')
app.use(cors())

app.get('/:roomId', (req, res, next) => {
  try{
    res.status(200).render(__dirname + '/index.ejs', { id: req.params.roomId });
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

app.get('/room/:roomId', (req, res, next) => {
  try {
    const { roomId } = req.params;

    const roomIndex = roomArray.map(as=>as.roomId).indexOf(roomId);

    if(roomIndex === -1) {
      throw new Error('room did not found');
    }

    if(roomArray[roomIndex].players.length >= 2) {
      throw new Error('room is full');
    }

    roomArray[roomIndex].players.push('player');
    res.status(200).json({message: 'succes'});
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
})

io.of('/web-socket/home').on('connection', (socket) => {
  if(playersArray.indexOf(socket) === -1){
    console.log(playersArray.indexOf(socket))
    console.log('a user connected');
    playersArray.push(socket);
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('createRoom', (msg) => {
    const data =  {
      status: 'waiting',
      roomType: msg.roomType,
      roomId: nanoid(10),
      roomName: msg.roomName,
      players: [
        msg.players
      ]
    };

    roomArray.push(data);

    console.log(typeof msg)
    console.log(msg)
    if(data.roomtype === 'public'){
      io.emit('createRoom', data);
    }
  })

  socket.on('createRoom', (data) => {
    console.log(typeof msg)
    console.log(msg)
    io.emit(msg.socket, msg.message);
  });
})

io.of('/web-socket/room').on('connection', (socket) => {
  if(playersArray.indexOf(socket) === -1){
    console.log(playersArray.indexOf(socket))
    console.log('a user connected');
    playersArray.push(socket);
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

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

    roomArray.push(msg.data);

    console.log(typeof msg)
    console.log(msg)
    if(data.roomtype === 'public'){
      io.emit(roomId, msg);
    }
  })
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('room', (msg) => {
    console.log(typeof msg)
    console.log(msg)
    io.emit(msg.socket, msg.message);
  });
})

server.listen(3001, () => {
  console.log('server running at port 3001');
})
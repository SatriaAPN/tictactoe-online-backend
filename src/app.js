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

// middleware
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use((req, res, next) => {
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

app.get('/api/rooms/:uuid', (req, res, next) => {
  try {
    const { uuid } = req.params;

    const roomIndex = roomsArray.map(as=>as.uuid).indexOf(uuid);

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
    console.log('createRoom')
    console.log(msg)
    const body = {
      jwtToken: msg.Authorization, // Header jwt {token}
      roomType: msg.roomType,
      roomName: msg.roomName
    }

    const user = await verifJwtToken(body.jwtToken); // {username, uuid}

    const data =  {
      roomWaiting: true,
      roomType: body.roomType,
      roomUuid: nanoid(10),
      roomName: body.roomName,
      players: [
        {
          username: user.username,
          uuid: user.uuid
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
})

const verifJwtToken = async(token) => {
  const jwtToken = token.split(' ')[2]; // Header jwt {token}

  return await jwt.verify(jwtToken, secretKey);
}

server.listen(3001, () => {
  console.log('server running at port 3001');
})
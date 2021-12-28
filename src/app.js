const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// middleware
app.set('view engine', 'ejs')

app.get('/:id', (req, res, next) => {
  try{
    const { id } = req.params;

    res.status(200).render(__dirname + '/index.ejs', {id});
  } catch(err) {
    res.status(400).json({ message: 'gagal' });
  }
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

server.listen(3000, () => {
  console.log('server running at port 3000');
})
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const testRoomId = 'room-test'

const testRoomDatas =  {
    roomId: testRoomId,
    participants: [],
}

const getParticipantsNum = () => { return testRoomDatas.participants.length }

app.get('/', (req, res) => {
  res.sendStatus(200)
});

app.get('/reset', (req, res) => {
  testRoomDatas.participants = []
  res.sendStatus(200)
});

io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('join', (_userData) => {
        console.log('user joined', _userData)
        const userData = _userData

        if (getParticipantsNum() === 0) userData.key = true
        else userData.key = false

        testRoomDatas.participants.push(userData)

        io.emit('room-updated', testRoomDatas);
    });

    socket.on('leave', (id) => { 
        testRoomDatas.participants = testRoomDatas.participants.filter(p => p.id !== id)
        io.emit('room-updated', testRoomDatas);
    });

    socket.on('request-data', () => { 
      socket.broadcast.emit('room-updated', testRoomDatas)
    });
  
    socket.on('disconnect', () => {
      console.log('a user lost connection');
    });
});
const port = process.env.PORT || 1111;
server.listen(port, () => {
  console.log('listening on ' + port + '...');
});
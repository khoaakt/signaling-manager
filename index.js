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

const sendNewRoomDataToEveryone = () => {
    io.emit('room-updated', testRoomDatas);
}

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

        console.log(testRoomDatas)
        socket.broadcast.emit('room-updated', testRoomDatas)

        sendNewRoomDataToEveryone()
    });

    socket.on('leave', (id) => { 
        testRoomDatas.participants = testRoomDatas.participants.filter(p => p.id !== id)
        socket.broadcast.emit()

        sendNewRoomDataToEveryone()
    });

    socket.on('request-data', () => { 
      socket.broadcast.emit('room-updated', testRoomDatas)
    });
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});

server.listen(3004, () => {
  console.log('listening on *:3004');
});
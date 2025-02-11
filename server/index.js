const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const https = require("https");
const fs = require("fs");
const cors = require('cors');


const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
  };
const app = express();
const server = https.createServer(options, app)
const io = new Server(server, { cors: { origin: 'https://10.201.27.81:5173' } });
app.use(cors)
mongoose
  .connect('mongodb://127.0.0.1:27017/chatApp')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error:', err));

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNum: { type: Number, required: true, unique: true },
  roomPass: { type: String, required: true },
  members: { type: Array, default: [] },
});

const Room = mongoose.model('Room', roomSchema);
const socketToEmailMap = new Map();

// app.use(cors());
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('create-room', async ({ roomNum, roomPassword }) => {
    try {
      await Room.create({ roomNum, roomPass: roomPassword });
      console.log("Room created")
      io.to(socket.id).emit('room-created');
    } catch (err) {
      console.error('Error creating room:', err);
      io.to(socket.id).emit('error', { msg: 'Room creation failed. Try another room number.' });
    }
  });

  socket.on('join-req', async ({ from, room, roomPass }) => {
    try {
      const currRoom = await Room.findOne({ roomNum: room });
      if (!currRoom) {
        io.to(socket.id).emit('error', { msg: 'Room not found' });
        return;
      }

      if (currRoom.roomPass !== roomPass) {
        io.to(socket.id).emit('error', { msg: 'Wrong password' });
        return;
      }

      if (currRoom.members.length < 2) {
        await Room.updateOne(
          { roomNum: room },
          { $push: { members: { username: from, socketId: socket.id } } }
        );
        socket.join(room);
        socketToEmailMap.set(socket.id, from);
        console.log(socketToEmailMap)
        io.to(room).emit('user-joined', { email: from, socketId: socket.id });
        io.to(socket.id).emit('joining-room', { roomNum: room, roomPass });
      } else {
        io.to(socket.id).emit('error', { msg: 'Room is full' });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      io.to(socket.id).emit('error', { msg: 'An error occurred while joining' });
    }
  });

  socket.on('connect-user', ({ to, offer }) => {
    const email = socketToEmailMap.get(socket.id);
    if (io.sockets.sockets.get(to)) {
      io.to(to).emit('incoming-call', { from: socket.id, email, offer });
    } else {
      io.to(socket.id).emit('error', { msg: 'User not available' });
    }
  });

  socket.on('call-accepted', ({ to, ans }) => {
    io.to(to).emit('ans-of-call', { from: socket.id, ans });
  });

  socket.on('nego-needed', ({ to, offer }) => {
    io.to(to).emit('nego-inquire', { from: socket.id, offer });
  });

  socket.on('nego-answer', ({ to, ans }) => {
    io.to(to).emit('nego-done', { from: socket.id, ans });
  });

  socket.on('video-call', ({ to }) => {
    io.to(to).emit('video-call', { from: socket.id });
  });

  socket.on('accepting-video-call', ({ to }) => {
    io.to(to).emit('video-call-accepted', { from: socket.id });
  });

  socket.on('end-call', ({ to }) => {
    io.to(to).emit('end-call');
  });

  socket.on('disconnect', async () => {
    try {
      const room = await Room.findOne({ 'members.socketId': socket.id });
      if (!room) return;

      if (room.members.length === 1) {
        await Room.deleteOne({ roomNum: room.roomNum });
        console.log('Room deleted. roomId:', room.roomNum);
      } else {
        const result = await Room.updateOne(
          { 'members.socketId': socket.id },
          { $pull: { members: { socketId: socket.id } } }
        );
        if (result.modifiedCount > 0) {
          console.log('User', socket.id, 'left the room');
        } else {
          console.log('Error removing user from room');
        }
      }
      console.log(`Disconnected: ${socket.id}`);
      io.to(room).emit("Error", {msg: "Other user left"})
      socketToEmailMap.delete(socket.id);
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
});

server.listen(8000, () => console.log('Server running on port 8000'));

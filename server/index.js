const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const front_end_url = process.env.FRONT_END_URL;
const io = new Server(server, { cors: { origin: front_end_url } });

// ✅ Fix CORS middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Use a single DB_URL
const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Error:", err));

const roomSchema = new mongoose.Schema({
  roomNum: { type: Number, required: true, unique: true },
  roomPass: { type: String, required: true },
  members: { type: Array, default: [] },
});

const memberSchema = new mongoose.Schema({
  username: { type: String, required: true },
  socketId: { type: String, required: true, unique: true },
});

const Member = mongoose.model("Member", memberSchema);
const Room = mongoose.model("Room", roomSchema);

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('create-room', async ({ roomNum, roomPassword }) => {
    try {
      await Room.create({ roomNum, roomPass: roomPassword });
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
        await Member.create({
          username: from,
          socketId: socket.id
        })
        // socketToEmailMap.set(socket.id, from);
        console.log(socket.id, " : ", from);
        io.to(room).emit('user-joined', { email: from, socketId: socket.id });
        socket.join(room);
        io.to(socket.id).emit('joining-room', { email: from, socketId: socket.id, roomNum: room, roomPass: roomPass });
        
        
      } else {
        io.to(socket.id).emit('error', { msg: 'Room is full' });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      io.to(socket.id).emit('error', { msg: 'An error occurred while joining' });
    }
  });

  socket.on('connect-user', async ({ to, offer }) => {
    try{
      const member = await Member.findOne({socketId: socket.id})
      const email = member.username;
      if (io.sockets.sockets.get(to)) {
        io.to(to).emit('incoming-call', { from: socket.id, email, offer });
      } else {
        io.to(socket.id).emit('error', { msg: 'User not available' });
      }
    }
    catch(error){
      console.log("error: ", error)
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

  socket.on('second-nego',({to})=>{
    io.to(to).emit('second-nego', {from: socket.id})
})

  socket.on('video-call', ({ to }) => {
    io.to(to).emit('video-call', { from: socket.id });
  });

  socket.on('accepting-video-call', ({ to }) => {
    io.to(to).emit('video-call-accepted', { from: socket.id });
  });

  socket.on('end-call', ({ to }) => {
    io.to(to).emit('end-call');
  });

  socket.on('stop-download', ({to})=>{
    io.to(to).emit('stop-download', {})
  })

  socket.on('stop-upload', ({to})=>{
    io.to(to).emit('stop-upload', {}  )
  })

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
          const member = Member.findOne({socketId: socket.id})
          const name = member.username;
          console.log('User', socket.id, 'left the room');
          io.to(room.roomNum).emit("user-left", {name: name, socketId: socket.id})
        } else {
          console.log('Error removing user from room');
        }
      }
      console.log(`Disconnected: ${socket.id}`);
      io.to(room).emit("Error", {msg: "Other user left"})
      // socketToEmailMap.delete(socket.id);
      await Member.findOneAndDelete({socketId: socket.id});
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
});


const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Server running on port ${port}`));
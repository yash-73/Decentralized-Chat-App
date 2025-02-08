const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const {Server} = require('socket.io')

const io = new Server({
    cors: true
})

mongoose.connect('mongodb://127.0.0.1:27017/chatApp')
.then(()=>{console.log("MongoDB connected")})
.catch((err)=>{
    console.log("Error: ", err)
})

//Room Schema
const roomSchema = new mongoose.Schema({
        roomNum: {
            type: Number,
            required: true,
            unique: true,
        },
        roomPass: {
            type: String,
            required: true
        },
        members: {
            type: Array,
        }
})


const rooms = mongoose.model("rooms", roomSchema)
const app = new express()
const socketToEmailMap = new Map();



app.use(bodyParser.json())

io.on('connection', (socket)=>{
    try{

    console.log("New connection: ", socket.id);


    socket.on('create-room' , async ({roomNum, roomPassword})=>{
        await rooms.create({
            roomNum: roomNum,
            roomPass: roomPassword,
        }).then(()=>{
            io.to(socket.id).emit('room-created')
        }).catch((err)=> {
            console.log("Error: ", err);
            io.to(socket.id).emit("error", {msg: err})
        })
            
    })

    socket.on('join-req',async (data)=>{
        const {from , room , roomPass} = data;

        await rooms.findOne({roomNum: room})
        .then(async (currRoom)=>{
            if(currRoom.roomPass === roomPass){
                if(currRoom.members.length <= 1){
                    await rooms.updateOne({roomNum: room}, {$push: {members: {username: from , socketId: socket.id}}})
                    .then((newRoom)=> console.log(newRoom));
                    console.log(from , " is joining the room ", room)
                    socket.join(room);
                    socketToEmailMap.set(socket.id , from)
                    io.to(room).emit('user-joined', {email: from, socketId: socket.id})
                    io.to(socket.id).emit('joining-room', {roomNum: room , roomPass})
                }
                else{
                    io.to(socket.id).emit("error", {msg: "Room is full"})
                }
                
            }
            else{
                io.to(socket.id).emit('error', {err: 'Wrong Password'});
            }
        })
        .catch((error)=>{
                console.log("Error: ", error)
                io.to(socket.id).emit('error', {err: 'no room found'})
        })
      
    })

    socket.on('connect-user', ({to, offer})=>{
        const email = socketToEmailMap.get(socket.id)
        io.to(to).emit('incoming-call', {from: socket.id, email ,offer})
    })

    socket.on('call-accepted', ({to , ans})=>{
        io.to(to).emit('ans-of-call',{ from:socket.id, ans})
    })


    socket.on('nego-needed', ({to , offer})=>{
        io.to(to).emit('nego-inquire', {from : socket.id, offer})
    })

    socket.on('nego-answer', ({to , ans})=>{
        io.to(to).emit('nego-done', {from: socket.id, ans})
    })

    socket.on('second-nego',({to})=>{
        io.to(to).emit('second-nego', {from: socket.id})
    })

    socket.on('video-call', ({to})=>{
            io.to(to).emit('video-call', {from: socket.id})
    })

    socket.on('accepting-video-call', ({to})=>{
        io.to(to).emit('video-call-accepted', {from: socket.id})
    })

    socket.on('end-call', ({to})=>{
        io.to(to).emit('end-call')
    })


    socket.on('disconnect', async () => {

        try{
        
        const room = await rooms.findOne({"members.socketId" : socket.id})
        
        if (!room) return;
        
        if (room.members.length == 1){
                await rooms.deleteOne({roomNum : room.roomNum});
                console.log("Room deleted. roomId: ", room.roomNum);
            }
        else{
                const result = await rooms.updateOne(
                    { "members.socketId": socket.id },
                    { $pull: { members: { socketId: socket.id}}}
                )

                if(result.modifiedCount > 0){
                    console.log("User ", socket.id, "left the room")
                }
                else{
                    console.log("Some error occured while removing user from room")
                }
            }
        
        
        
        console.log(`Disconnected: ${socket.id}`);
        }
        catch (error){
            console.log("Error on disconnect: ", error)
        }
    });
    }
    catch(error){
        console.log("Error: ", error.message)
    }
})

// io.off()

app.listen(8000 , ()=> console.log("HTTP server running at port 8000"))
io.listen(8001)
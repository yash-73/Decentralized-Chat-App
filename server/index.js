const express = require('express')
const bodyParser = require('body-parser')
const {Server} = require('socket.io')

const io = new Server({
    cors: true
})

const app = new express()

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();
const rooms = new Map();
app.use(bodyParser.json())

io.on('connection', (socket)=>{
    console.log("New connection: ", socket.id);

    socket.on('create-room' , ({roomNum, roomPassword})=>{
            rooms.set(roomNum, roomPassword);
            io.to(socket.id).emit('room-created')
    })

    socket.on('join-req', (data)=>{
        const {from , room , roomPass} = data;

        emailToSocketMap.set(from, socket.id);
        socketToEmailMap.set(socket.id, from);

        if (rooms.has(room)){
            if(rooms.get(room) === roomPass){
                console.log(from , " is joining the room ", room)
                socket.join(room);
                io.to(room).emit('user-joined', {email: from, socketId: socket.id})
                io.to(socket.id).emit('joining-room', {room})
            }
            else{
                io.to(socket.id).emit('wrong-password');
            }
        }
        else{
            io.to(socket.id).emit('no-room-found')
        }

        
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


    socket.on('disconnect', () => {
        console.log(`Disconnected: ${socket.id}`);
    });
})

// io.off()

app.listen(8000 , ()=> console.log("HTTP server running at port 8000"))
io.listen(8001)
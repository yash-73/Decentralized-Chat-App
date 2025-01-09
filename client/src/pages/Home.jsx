import { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../provider/Socket";

function Home() {

    const navigate = useNavigate();
    const socket = useContext(SocketContext);

    const [email,setEmail] = useState('');
    const [roomId, setRoomId] = useState('');


    const handleJoinRoom = ()=>{
        console.log("Sending join room request now from", email, "to room", roomId)
        socket.emit('join-req', {from: email,  room: roomId})
    }

    const handleJoiningRoom = useCallback(({room})=>{
            console.log("Joining room", room);
            navigate(`/room/${room}`)
    },[navigate])


    useEffect(() => {
        socket.on('connect', () => console.log('Socket connected:', socket.id));
        socket.on('disconnect', () => console.log('Socket disconnected'));
        socket.on('joining-room', handleJoiningRoom);
    
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('joining-room')
        };
    }, [socket, handleJoiningRoom]);
    

    return (
        <div className="flex flex-row justify-center h-[90vh] items-center">
        <div className="flex flex-col justify-around h-[30vh] bg-gray-300 border-[1px] focus:border-[2px] no-underline focus:border-gray-400 border-gray-400 rounded-xl p-8">
            <input type="text" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder='Enter your email here'
            className="pl-2 "/>
            <input type='text' value={roomId} onChange={(e)=> setRoomId(e.target.value)} placeholder='Enter room code' 
            className="pl-2"/>
            <button onClick={handleJoinRoom} className="bg-white border-[1px] border-gray-400 rounded-md focus:font-semibold">Enter room</button>
        </div>
        </div>
    )
}

export default Home

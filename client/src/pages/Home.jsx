import { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../provider/Socket";
import NavBar from "../components/NavBar";
import Login from "../components/Login";
import JoinRoom from "../components/JoinRoom";
import axios from "axios";

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
        <div className="flex flex-col  justify-center items-center">
            <div className={`flex flex-col justify-evenly items-center w-full h-[100vh] bg-black`}>
                <div className="flex flex-row justify-evenly items-center w-full  ">
                <div className=" text-[70px] max-w-[50%] break-words font-bold text-gray-300  text-left px-[5%]">
                    Chat with your friends with complete privacy 
                </div>
                <div className="flex flex-col h-full max-w-[50%] items-center justify-center px-[5%] ">
                    <JoinRoom/>
                </div>
            </div>
            <button className="text-white my-4 px-4 py-2 w-[20%] outline-none  bg-gray-900 hover:bg-gray-100 shadow-lg delay-75 transition-all hover:text-gray-900 rounded-lg font-semibold ">Create Room</button></div>
        </div>
    )
}

export default Home
// hover:shadow-[0_0_5px_1px]
// hover:shadow-gray-300
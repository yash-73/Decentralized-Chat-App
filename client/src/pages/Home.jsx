import { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../provider/Socket";
import JoinRoom from "../components/JoinRoom";
import CreateRoom from "../components/CreateRoom";
import {useDispatch} from 'react-redux'
import {createRoom} from '../store/roomSlice'

function Home() {

    

    const [error, setError] = useState("")
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const dispatch = useDispatch()

    

    const handleRoomCreate =async (username, roomNum, roomPassword)=>{
        socket.emit('create-room', {roomNum, roomPassword});
        handleJoinRoom(username, roomNum, roomPassword)

    }
    const handleJoinRoom = useCallback((username, roomNum , roomPassword)=>{
        console.log("Sending join room request now from", username, "to room", roomNum)
        socket.emit('join-req', {from: username,  room: roomNum , roomPass: roomPassword})
    },[socket])

    const handleJoiningRoom = useCallback((data)=>{
            console.log("Joining room", data.roomNum);
            console.log(data)
            dispatch(createRoom({roomData: data}))
            navigate(`/room/${data.roomNum}`)
    },[navigate, dispatch])


    useEffect(() => {
        socket.on('room-created' , ()=>{console.log("Room created ")})
        socket.on('wrong-password', ()=>{setError('Wrong password')})
        socket.on('no-room-found', ()=>{setError("No Room found")})
        socket.on('connect', () => console.log('Socket connected:', socket.id));
        socket.on('disconnect', () => console.log('Socket disconnected'));
        socket.on('joining-room', handleJoiningRoom);

    
        return () => {
            socket.off('room-created')
            socket.off('connect');
            socket.off('disconnect');
            socket.off('joining-room')
            socket.off('wrong-password');
            socket.off('no-room-found')
        };
    }, [socket, handleJoiningRoom, handleJoinRoom]);
    

    return (
        <div className="flex flex-col  justify-center items-center">
            <div className={`flex flex-col justify-center items-center w-full h-[100vh] bg-black`}>
                <div className="flex md:flex-row max-md:flex-col justify-evenly items-center w-full  ">

                 <JoinRoom handleJoinRoom={handleJoinRoom}/>

                 <div className=" md:text-[70px] max-md:text-[35px] md:max-w-[50%] max-md:w-full break-words font-bold text-gray-300  text-center px-[5%]">
                    Chat with your friends with complete privacy 
                </div>

                <CreateRoom handleRoomCreate={handleRoomCreate}/>
                
            </div>
            
           </div>

           {error && <span className="text-red-500">{error}</span>}

            
        </div>
    )
}

export default Home
// hover:shadow-[0_0_5px_1px]
// hover:shadow-gray-300
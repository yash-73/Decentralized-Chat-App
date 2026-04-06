import {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import { MdOutlineAutorenew } from "react-icons/md";
function CreateRoom({className, handleRoomCreate}) {

    const [username, setUsername] = useState("")
    const [roomPassword, setRoomPassword] = useState("");
    const [roomNum, setRoomNum]  = useState( Math.floor(100000 + Math.random() * 900000).toString());
    const [error, setError] = useState("")


    const handleSubmit = (e)=>{
        e.preventDefault();
        if(username.length == 0){
            setError("Username cannot be empty");
            return;
        }
        if(roomPassword.length < 6){
            setError("Password must contain atleast 6 characters");
            return;
        }
        handleRoomCreate(username, roomNum, roomPassword);
    }

    useEffect(()=>{
        if(error.length > 0) alert(error)
    },[error])

    return (
       
                <form 
                className={`flex flex-col bg-white/5 backdrop-blur-xl items-center py-6 px-8 ${className} z-10 rounded-3xl border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='mb-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500'>Create Room</div>


                    <div className='flex flex-col mb-4  w-full'>
                    <label className='text-sm font-medium text-gray-300 mb-1 ml-1' htmlFor="username">Username</label>
                    <input type="text"
                    className='bg-black/20 focus:bg-black/40 border border-gray-700 focus:border-teal-500 text-white px-3 py-2 rounded-xl outline-none transition-all focus:ring-2 focus:ring-teal-500/20' 
                        required
                      id='username'
                      autoComplete="off"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className='flex flex-col mb-4 w-full'>
                    <label className='text-sm font-medium text-gray-300 mb-1 ml-1' htmlFor="roomNumber">Room Number</label>
                    <div
                    className='bg-black/20 border border-gray-700 text-white px-3 py-2 rounded-xl flex flex-row justify-between items-center transition-all'  
                      id='roomNumber'
                      > <span className="font-mono tracking-wider">{roomNum}</span>   <MdOutlineAutorenew  
                      onClick={(e)=>{e.preventDefault(); setRoomNum(Math.floor(100000 + Math.random() * 900000).toString())}}
                      className='cursor-pointer text-xl text-teal-400 hover:text-teal-300 hover:rotate-180 transition-all duration-300'/></div>
                    </div>

                    <div className='flex flex-col mb-6 w-full'>
                    <label className='text-sm font-medium text-gray-300 mb-1 ml-1' htmlFor="roomPassword">Room Password</label>
                    <input type="password"
                    className='bg-black/20 focus:bg-black/40 border border-gray-700 focus:border-teal-500 text-white px-3 py-2 rounded-xl outline-none transition-all focus:ring-2 focus:ring-teal-500/20' 
                      id='roomPassword'
                    autoComplete="off"
                        required
                        placeholder="At least 6 characters"
                      value={roomPassword}
                      onChange={(e)=>{setRoomPassword(e.target.value)}}/>
                    </div>

                    <button  className='mt-2 py-2.5 w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 shadow-[0_0_20px_rgba(20,184,166,0.3)] text-white font-bold rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]'>
                        Create Room
                    </button>

                    

                </form>
        
    )
}

CreateRoom.propTypes = {
    className : PropTypes.string,
    handleRoomCreate: PropTypes.func.isRequired
}

export default CreateRoom

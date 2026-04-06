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
                className={`flex flex-col bg-zinc-900 items-start py-8 px-8 w-[350px] max-w-full ${className} z-10 border border-zinc-800`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='mb-8 text-xl font-bold text-teal-400 uppercase tracking-widest'>Create Room</div>


                    <div className='flex flex-col mb-6  w-full'>
                    <label className='text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide' htmlFor="username">Username</label>
                    <input type="text"
                    className='bg-zinc-950 focus:bg-black border border-zinc-700 focus:border-teal-400 text-white px-3 py-3 outline-none transition-colors' 
                        required
                      id='username'
                      autoComplete="off"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className='flex flex-col mb-6 w-full'>
                    <label className='text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide' htmlFor="roomNumber">Room Number</label>
                    <div
                    className='bg-zinc-950 border border-zinc-700 text-white px-3 py-3 flex flex-row justify-between items-center transition-colors'  
                      id='roomNumber'
                      > <span className="font-mono tracking-wider">{roomNum}</span>   <MdOutlineAutorenew  
                      onClick={(e)=>{e.preventDefault(); setRoomNum(Math.floor(100000 + Math.random() * 900000).toString())}}
                      className='cursor-pointer text-xl text-teal-400 hover:text-teal-300 transition-colors duration-300'/></div>
                    </div>

                    <div className='flex flex-col mb-8 w-full'>
                    <label className='text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide' htmlFor="roomPassword">Room Password</label>
                    <input type="password"
                    className='bg-zinc-950 focus:bg-black border border-zinc-700 focus:border-teal-400 text-white px-3 py-3 outline-none transition-colors' 
                      id='roomPassword'
                    autoComplete="off"
                        required
                        placeholder="At least 6 characters"
                      value={roomPassword}
                      onChange={(e)=>{setRoomPassword(e.target.value)}}/>
                    </div>

                    <button  className='mt-2 py-3 w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-black font-bold uppercase tracking-wider transition-colors'>
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

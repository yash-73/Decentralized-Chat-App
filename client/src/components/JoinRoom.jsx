import {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
function JoinRoom({className, handleJoinRoom}) {

    const [username, setUsername] = useState("")
    const [roomNum, setRoomNum] = useState("");
    const [roomPassword, setRoomPassword] = useState("");
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

      handleJoinRoom(username, roomNum, roomPassword);
    }

    useEffect(()=>{
      if(error.length != 0){
        alert(error)
      }
    },[error])

    return (
       
                <form 
                className={`flex flex-col bg-zinc-900 items-start py-8 px-8 w-[350px] max-w-full ${className} z-10 border border-zinc-800`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='mb-8 text-xl font-bold text-teal-400 uppercase tracking-widest'>Join Room</div>


                    <div className='flex flex-col mb-6 w-full'>
                    <label className='text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide' htmlFor="joinUsername">Username</label>
                    <input type="text"
                    className='bg-zinc-950 focus:bg-black border border-zinc-700 focus:border-teal-400 text-white px-3 py-3 outline-none transition-colors' 
                      id='joinUsername'
                      autoComplete="off"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className='flex flex-col mb-6 w-full'>
                    <label className='text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide' htmlFor="joinRoomNumber">Room Number</label>
                    <input type="text"
                    className='bg-zinc-950 focus:bg-black border border-zinc-700 focus:border-teal-400 text-white px-3 py-3 outline-none transition-colors font-mono tracking-wider' 
                      id='joinRoomNumber'
                      autoComplete="off"
                      placeholder="6-digit code"
                      value={roomNum}
                      onChange={(e)=>{setRoomNum(e.target.value)}}/>
                    </div>

                    <div className='flex flex-col mb-8 w-full'>
                    <label className='text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide' htmlFor="joinRoomPassword">Room Password</label>
                    <input type="password"
                    className='bg-zinc-950 focus:bg-black border border-zinc-700 focus:border-teal-400 text-white px-3 py-3 outline-none transition-colors' 
                      id='joinRoomPassword'
                    autoComplete="off"
                      placeholder="Enter password"
                      value={roomPassword}
                      onChange={(e)=>{setRoomPassword(e.target.value)}}/>
                    </div>

                    <button className='mt-2 py-3 w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-black font-bold uppercase tracking-wider transition-colors'>
                        Join
                    </button>

                </form>
        
    )
}

JoinRoom.propTypes = {
    className : PropTypes.string,
    handleJoinRoom : PropTypes.func.isRequired,
}

export default JoinRoom

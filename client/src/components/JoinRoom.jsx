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
                className={`flex flex-col bg-white/5 backdrop-blur-xl items-center py-6 px-8 ${className} z-10 rounded-3xl border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='mb-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500'>Join Room</div>


                    <div className='flex flex-col mb-4 w-full'>
                    <label className='text-sm font-medium text-gray-300 mb-1 ml-1' htmlFor="joinUsername">Username</label>
                    <input type="text"
                    className='bg-black/20 focus:bg-black/40 border border-gray-700 focus:border-teal-500 text-white px-3 py-2 rounded-xl outline-none transition-all focus:ring-2 focus:ring-teal-500/20' 
                      id='joinUsername'
                      autoComplete="off"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className='flex flex-col mb-4 w-full'>
                    <label className='text-sm font-medium text-gray-300 mb-1 ml-1' htmlFor="joinRoomNumber">Room Number</label>
                    <input type="text"
                    className='bg-black/20 focus:bg-black/40 border border-gray-700 focus:border-teal-500 text-white px-3 py-2 rounded-xl outline-none transition-all focus:ring-2 focus:ring-teal-500/20 font-mono tracking-wider' 
                      id='joinRoomNumber'
                      autoComplete="off"
                      placeholder="6-digit room code"
                      value={roomNum}
                      onChange={(e)=>{setRoomNum(e.target.value)}}/>
                    </div>

                    <div className='flex flex-col mb-6 w-full'>
                    <label className='text-sm font-medium text-gray-300 mb-1 ml-1' htmlFor="joinRoomPassword">Room Password</label>
                    <input type="password"
                    className='bg-black/20 focus:bg-black/40 border border-gray-700 focus:border-teal-500 text-white px-3 py-2 rounded-xl outline-none transition-all focus:ring-2 focus:ring-teal-500/20' 
                      id='joinRoomPassword'
                    autoComplete="off"
                      placeholder="Enter password"
                      value={roomPassword}
                      onChange={(e)=>{setRoomPassword(e.target.value)}}/>
                    </div>

                    <button className='mt-2 py-2.5 w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 shadow-[0_0_20px_rgba(20,184,166,0.3)] text-white font-bold rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]'>
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

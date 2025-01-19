import {useState} from 'react'
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
      
      console.log({
          username,
          roomNum, roomPassword
      });
    }

    return (
       
                <form 
                className={`flex flex-col backdrop-blur-lg  items-center py-2 px-4 ${className} z-10 rounded-2xl border-[1px] border-gray-500 shadow-lg`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='my-4 text-[18px] font-bold text-gray-300'>Join Room</div>


                    <div className='flex flex-col my-2 text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="JoinUsername">Username</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                      id='joinUsername'
                      autoComplete="off"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className='flex flex-col my-2 text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="joinRoomNumber">Room Number</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                      id='joinRoomNumber'
                      autoComplete="off"
                      value={roomNum}
                      onChange={(e)=>{setRoomNum(e.target.value)}}/>
                    </div>

                    <div className='flex flex-col my-2 text-gray-300'>
                    <label className='text-14px font-semibold' htmlFor="joinRoomPassword">Room Password</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white   pl-2 py-1 border-gray-600 outline-none' 
                      id='joinRoomPassword'
                    autoComplete="off"

                      value={roomPassword}
                      onChange={(e)=>{setRoomPassword(e.target.value)}}/>
                    </div>

                    <button className='my-4 py-1 w-full hover:bg-gray-300 shadow-md text-white hover:text-black font-semibold bg-gray-800  transition-all delay-100 px-4  border-gray-800 rounded-lg'>
                        Join
                    </button>

                </form>
        
    )
}

JoinRoom.propTypes = {
    className : PropTypes.string
}

export default JoinRoom

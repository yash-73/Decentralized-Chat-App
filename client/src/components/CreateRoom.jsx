import {useState} from 'react'
import PropTypes from 'prop-types'
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

                    <div className='my-4 text-[18px] font-bold text-gray-300'>Create Room</div>


                    <div className='flex flex-col my-2 text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="username">Username</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                        required
                      id='username'
                      autoComplete="off"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>
                    <div className='flex flex-col my-2 w-full text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="roomNumber">Room Number</label>
                    <div
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none cursor-text'  
                      id='roomNumber'

                      
                      > {roomNum}</div>
                    </div>

                    <div className='flex flex-col my-2 text-gray-300'>
                    <label className='text-14px font-semibold' htmlFor="roomPassword">Room Password</label>
                    <input type="password"
                    className='bg-transparent border-[1px] focus:border-white   pl-2 py-1 border-gray-600 outline-none' 
                      id='roomPassword'
                    autoComplete="off"
                        required
                        
                      value={roomPassword}
                      onChange={(e)=>{setRoomPassword(e.target.value)}}/>
                    </div>

                    <button  className='my-4 py-1 w-full hover:bg-gray-300 shadow-md text-white hover:text-black font-semibold bg-gray-800  transition-all delay-100 px-4  border-gray-800 rounded-lg'>
                        Create Room
                    </button>

                </form>
        
    )
}

CreateRoom.propTypes = {
    className : PropTypes.string
}

export default CreateRoom

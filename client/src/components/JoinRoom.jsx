import {useState} from 'react'
import PropTypes from 'prop-types'
function JoinRoom({className}) {

    const [roomNum, setRoomNum] = useState("");
    const [roomPassword, setRoomPassword] = useState("");

    const handleSubmit = (e)=>{
        e.preventDefault();
        if(roomNum.length == 0 || roomPassword.length == 0) {
            console.log("Empty") 
        return;}
        console.log({
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
                    <label className='text-[14px] font-semibold' htmlFor="roomNumber">Room Number</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                      id='roomNumber'
                      autoComplete="off"
                      value={roomNum}
                      onChange={(e)=>{setRoomNum(e.target.value)}}/>
                    </div>

                    <div className='flex flex-col my-2 text-gray-300'>
                    <label className='text-14px font-semibold' htmlFor="roomPassword">Room Password</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white   pl-2 py-1 border-gray-600 outline-none' 
                      id='roomPassword'
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

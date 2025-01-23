import {useState} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login as authLogin } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault();
    
         await axios.post('http://localhost:8080/api/auth/signin', {
            username: username ,
            password: password
          }
        ).then((response)=>{

            console.log(response.headers)
            console.log(response.config.headers)
            dispatch(authLogin(response.data))
            console.log(response.data);
            navigate('/');
          } ).catch(err=>{
            console.error(err);
          })
    
        
    }

    return (
       <div className='w-full bg-black flex flex-row  justify-center  items-center h-[100vh] '>
               <form 
                className={`flex flex-col backdrop-blur-lg justify-evenly  items-center py-2 px-4 w-[300px] h-[400px] z-10 rounded-2xl border-[1px] border-gray-500 shadow-lg`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='my-4 text-[18px] font-bold text-gray-300'>Login</div>

                    <div className='flex w-full flex-col my-2 text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="username">Username</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                      id='username'
                      autoComplete="off"
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>

                    <div className='flex w-full flex-col my-2 text-gray-300'>
                    <label className='text-14px font-semibold' htmlFor="roomPassword">Password</label>
                    <input type="password"
                    className='bg-transparent border-[1px] focus:border-white   pl-2 py-1 border-gray-600 outline-none' 
                      id='roomPassword'
                    autoComplete="off"

                      value={password}
                      onChange={(e)=>{setPassword(e.target.value)}}/>
                    </div>

                    <button className='my-4 py-1 w-full hover:bg-gray-300 shadow-md text-white hover:text-black font-semibold bg-gray-800  transition-all delay-100 px-4  border-gray-800 rounded-lg'>
                        Login
                    </button>

                </form>
                </div>
        
    )
}

Login.propTypes = {
    className : PropTypes.string
}

export default Login

import {useState} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
function Signup() {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [cPassword, setCPassword] = useState("")
    const [error, setError] = useState("")
    const [signupState, setSignupState] = useState(null)



    const handleSubmit =async  (e)=>{
        e.preventDefault();
       if (password != cPassword) {
        setError("Passwords don't match")
        return;
       }
       else{

        await axios.post('http://localhost:8080/api/auth/register' ,({

            username: username,
            emailId: email,
            password: password,
            role: ["USER"]


        })).then((response)=>{
          console.log(response)
          setSignupState(true)
          console.log(signupState)
        }).catch(error => {
              console.error(error);
              setSignupState(false)
              console.log(signupState)
        })

        console.log({
            username: username,
            emailId: email,
            password: password
        })
        setError("")
        
       }
    }

    return (
       <div className='w-full bg-black flex flex-row  justify-center  items-center h-[100vh] '>
               <form 
                className={`flex flex-col backdrop-blur-lg justify-evenly  items-center py-2 px-4 w-[300px] z-10 rounded-2xl border-[1px] border-gray-500 shadow-lg`}
                action="submit" 
                onSubmit={handleSubmit}
                >

                    <div className='my-4 text-[18px] font-bold text-gray-300'>Signup</div>

                    <div className='flex w-full flex-col my-2 text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="email">Email</label>
                    <input type="email"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                      id='email'
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e)=>{setEmail(e.target.value)}}/>
                    </div>

                    <div className='flex w-full flex-col my-2 text-gray-300'>
                    <label className='text-[14px] font-semibold' htmlFor="username">Username</label>
                    <input type="text"
                    className='bg-transparent border-[1px] focus:border-white text-gray-300  pl-2 py-1 border-gray-800 outline-none' 
                      id='username'
                      autoComplete="off"
                      required
                      value={username}
                      onChange={(e)=>{setUsername(e.target.value)}}/>
                    </div>

                    <div className='flex w-full flex-col my-2 text-gray-300'>
                    <label className='text-14px font-semibold' htmlFor="password">Password</label>
                    <input type="password"
                    className='bg-transparent border-[1px] focus:border-white   pl-2 py-1 border-gray-600 outline-none' 
                      id='password'
                    autoComplete="off"
                      required
                      value={password}
                      onChange={(e)=>{setPassword(e.target.value)}}/>
                    </div>

                    <div className='flex w-full flex-col my-2 text-gray-300'>
                    <label className='text-14px font-semibold' htmlFor="confirm-password"> Confirm Password</label>
                    <input type="password"
                    className='bg-transparent border-[1px] focus:border-white   pl-2 py-1 border-gray-600 outline-none' 
                      id='confirm-password'
                    autoComplete="off"
                    required
                      value={cPassword}
                      onChange={(e)=>{setCPassword(e.target.value)}}/>
                    </div>

                    <button className='my-4 py-1 w-full hover:bg-gray-300 shadow-md text-white hover:text-black font-semibold bg-gray-800  transition-all delay-100 px-4  border-gray-800 rounded-lg'>
                        Signup
                    </button>

                    {error && <span className='text-red-500'>{error}</span>}

                </form>

                </div>
        
    )
}

Signup.propTypes = {
    className : PropTypes.string
}

export default Signup

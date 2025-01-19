import {} from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

function NavBar({className}) {

    const status = useSelector((state)=>state.auth.status);

    const navElements = [
        {
            name: 'Home',
            to: '/',
            authStatus: true
        },
        {
            name: 'About',
            to: '/about',
            authStatus: true,
        },
        {
            name: 'Signup',
            to: '/signup',
            authStatus: !status,
        },
        {
            name: 'Login',
            to: '/login',
            authStatus: !status,
        },{
            name: 'Logout',
            to: '/logout',
            authStatus: status
        }

    ]

    return (
            // {hover:shadow-[0px_0px_4px_2px_rgba(255,255,255)]}
            <nav className={` ${className} flex flex-row bg-black  text-white justify-center items-center px-8  border-b-2 border-gray-300`}>
                <div className='absolute left-0 ml-[5%] '>Logo</div>
                <ul className='flex flex-row font-semibold justify-evenly w-[45%]' >
                   {navElements.map(item =>
                   item.authStatus ? (<Link className=' px-4 py-1 rounded-xl  hover:bg-white hover:text-black transition-all delay-75  ' key={item.name} to={item.to}> {item.name}</Link>) : null

                   )}
                </ul>
            </nav>
       
    )
}

NavBar.propTypes={
    className: PropTypes.string
}

export default NavBar

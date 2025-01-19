import {} from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function NavBar({className}) {


    const navElements = [
        {
            name: 'Home',
            to: '/',
        },
        {
            name: 'About',
            to: '/about',
        },
        
        

    ]

    return (
            // {hover:shadow-[0px_0px_4px_2px_rgba(255,255,255)]}
            <nav className={` ${className} flex flex-row bg-black  text-white justify-between items-center px-8  border-b-2 border-gray-300`}>
                <div className=' '>Logo</div>
                <ul className='flex flex-row font-semibold justify-between w-[20%]' >
                   {navElements.map(item =>
                   (<Link className=' px-4 py-1 rounded-xl  hover:bg-white hover:text-black transition-all delay-75  ' key={item.name} to={item.to}> {item.name}</Link>)

                   )}
                </ul>
            </nav>
       
    )
}

NavBar.propTypes={
    className: PropTypes.string
}

export default NavBar

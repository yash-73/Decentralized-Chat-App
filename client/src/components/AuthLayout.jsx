
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

export default function Protected({children, authentication = true}) {

    const navigate = useNavigate();
    const [loader , setLoader] = useState(true);
    const authStatus = useSelector((state)=>state.auth.status);

    useEffect( ()=>{
        if (authentication && authStatus !== authentication){
            navigate("/login")
        }
        else if (!authentication && authStatus !== authentication){
                navigate("/")
        }
        setLoader(false)
    } , [authStatus , navigate , authentication])


Protected.propTypes = {
    authentication: PropTypes.bool,
    children: PropTypes.element
}
     
    return loader? (<p>Loading....</p>
    ) :(children)

}



import { useMemo, createContext } from "react"
import { io } from "socket.io-client"
import PropTypes from 'prop-types'

const SocketContext = createContext(null);


export const SocketProvider = (props)=>{
        const socket = useMemo(()=> io('http://localhost:8001'), [])

        return (
            <SocketContext.Provider value={socket}>
                {props.children}
            </SocketContext.Provider>
        )
}

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired, // Ensures that children is provided and is renderable (string, element, or array)
};

export {SocketContext}






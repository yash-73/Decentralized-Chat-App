import { useMemo, createContext } from "react"
import { io } from "socket.io-client"
import PropTypes from 'prop-types'

const SocketContext = createContext(null);

const appUrl = import.meta.env.VITE_APP_URL;

export const SocketProvider = (props)=>{
        const socket = useMemo(()=> io(appUrl), [])

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






import { Outlet } from "react-router-dom"
import { SocketProvider } from "./provider/Socket"

export default function App() {

  return (
    <div>
      <SocketProvider >
      <Outlet/>
      </SocketProvider>
    </div>
  )
}
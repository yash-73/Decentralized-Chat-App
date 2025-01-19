import { Outlet } from "react-router-dom"
import { SocketProvider } from "./provider/Socket"
import NavBar from "./components/NavBar"
export default function App() {

  return (
    <div>
      <SocketProvider >
      <NavBar className={"w-full md:h-[100px] max-md:h-[70px] md:px-24 shadow-2xl"}/>
      <Outlet/>
      </SocketProvider>
    </div>
  )
}
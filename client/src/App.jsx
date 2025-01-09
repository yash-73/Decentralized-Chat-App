import { Routes , Route } from "react-router-dom"
import Home from "./pages/Home"
import Room from "./pages/Room"
import { SocketProvider } from "./provider/Socket"
export default function App() {

  return (
    <div>
      <SocketProvider >
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/room/*" element={<Room/>}/>
      </Routes>
      </SocketProvider>
    </div>
  )
}
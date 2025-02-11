import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Room from './pages/Room.jsx'
import None from './components/None.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: 
              <Home/>
             
        },
        {
            path: "/Room/*",
            element: (       
                      <Room />    
            ),
        }, 
        {
          path: '*',
          element: (
            <None/>
          )
        }
       
    ],
},
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)

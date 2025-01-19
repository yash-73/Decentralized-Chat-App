import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Login from './components/Login.jsx'
import Room from './pages/Room.jsx'
import Signup from './components/Signup.jsx'
import None from './components/None.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: <AuthLayout authentication={false}>
              <Home/>
              </AuthLayout>
        },
        {
            path: "/login",
            element: (
                <AuthLayout authentication={false}> 
                    <Login/>
                    </AuthLayout>
            ),
        },
        {
            path: "/Room/*",
            element: (
                    <AuthLayout authentication={true}>
                      <Room />
                    </AuthLayout>
            ),
        },
        {
          path: "/signup",
          element: (<Signup/>)
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

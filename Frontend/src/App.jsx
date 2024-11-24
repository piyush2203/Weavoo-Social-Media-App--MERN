/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import Signup from './components/Signup'
import Login from './components/Login'
import MainLayout from './components/MainLayout';
import Home from './components/Home';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ChatPage from './components/ChatPage';
import {io} from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux';
import { setSocket } from './components/redux/socketSlice';
import { setOnlineUsers } from './components/redux/chatSlice';
import { setLikeNotification } from './components/redux/notificationSlice';
import ProtectedRoute from './components/ProtectedRoute';


const BrowserRouter = createBrowserRouter([
  {
    path:"/",
    element:<ProtectedRoute> <MainLayout /> </ProtectedRoute>,
    children:[
      {
        path:'/',
        element:<ProtectedRoute> <Home/></ProtectedRoute>
      },
      {
        path:"/profile/:id",
        element:<ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path:"/account/edit",
        element:<ProtectedRoute><EditProfile /></ProtectedRoute>
      },
      {
        path:"/chat",
        element:<ProtectedRoute><ChatPage /></ProtectedRoute>
      }
    ]
  },
  {
    path:'/signup',
    element:<Signup />
  },
  {
    path:"/login",
    element:<Login/>
  }
])

const App = () => {

  const {user} = useSelector(store=>store.auth);
  const {socket} = useSelector(store=>store.socketio);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(user){
      const socketio = io('https://weavoo.onrender.com',{
        query:{
          userId:user?._id
        },
        transports:['websocket']
      });
      dispatch(setSocket(socketio));

      //listen all the events
      socketio.on('getOnlineUsers', (onlineUsers)=>{
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification)=>{
        dispatch(setLikeNotification(notification));
      })

      return () =>{
        socketio.close();
        dispatch(setSocket(null));
      }
      }else if(socket) {
        socket?.close();
        dispatch(setSocket(null));
    }
  }, [user,dispatch]);

  return (
    
    <>
      <RouterProvider router={BrowserRouter} />
    </>
  )
}

export default App

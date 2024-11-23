/* eslint-disable no-unused-vars */
import { setMessages } from "../components/redux/chatSlice";

import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRealTimeMessage = () => {
    const dispatch = useDispatch();
    const {socket} = useSelector(store=>store.socketio);
    const {messages} = useSelector(store=>store.chat);
    const {selectedUser} = useSelector(store=>store.auth);
    useEffect(() => {
        socket?.on('newMessage', (newMessage)=>{
            dispatch(setMessages([...messages,newMessage]));
        })
        return ()=>{
            socket?.off('newMessages');
        }
        
    }, [messages,setMessages]);
};
export default useGetRealTimeMessage;
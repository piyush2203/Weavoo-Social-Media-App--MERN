/* eslint-disable no-unused-vars */
import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar"
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from './redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from './redux/postSlice'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { clearLikeNotifications } from './redux/notificationSlice'




const LeftSideBar = () => {

    const navigate = useNavigate();
    const {user} = useSelector(store=>store.auth);
    const {likeNotification} = useSelector(store => store.realTimeNotification);
    const handlePopoverChange = (isOpen) => {
        if (!isOpen) {
            // Clear notifications when popover is closed
            dispatch(clearLikeNotifications());
        }
    };
    const dispatch = useDispatch();
    const [open, setopen] = useState(false);
   
    const logoutHandler = async() => {
        try {
            const res = await axios.get("https://weavoo.onrender.com/api/v1/user/logout", {withCredentials:true})
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }



    
    const sidbarHandler = (textType)=>{
        try {
           if(textType === "Logout"){
                logoutHandler(); 
            } else if(textType === "Create"){
                setopen(true);
            }else if(textType === 'Profile'){
                navigate(`/profile/${user?._id}`)
            }else if(textType === 'Home'){
                navigate('/')
            }else if(textType === 'Messages'){
                navigate('/chat')
            }
        } catch (error) {
            console.log(error);
            
        }
    }


    const sidebarItems = [
        {icon: <Home/>, text: "Home"},
        {icon: <Search/>, text: "Search"},
        {icon: <TrendingUp/>, text: "Explore"},
        {icon: <MessageCircle/>, text: "Messages"},
        {icon: <Heart/>, text: "Notification"},
        {icon: <PlusSquare/>, text: "Create"},
        {icon: 
            <Avatar className="w-6 h-6">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          , text: "Profile"},
        {icon: <LogOut/>, text: "Logout"},
        
    ]


  return (
    <div className='fixed flex-col bg-black flex top-0 z-10 left-0 w-[18%] h-screen'>
        
        <img src="/logo.png" alt="" className=' md:block hidden w-45 h-25 bg-red-00 mr-5 pt-[10%] pl-[10%] select-none'/>

        <div className=' items-center bg-gray-800 text-white h-max-screen py-[5%] overflow-hidden pl-4 rounded-r-full border-r-[1.5px] border-y-[1.5px] border-gray-400 w-full my-auto shadow-sm shadow-[#393B70]'>
          
            {
                sidebarItems.map((item,index)=>{
                    return (
                        <div key={index} onClick={()=>sidbarHandler(item.text)} className='flex items-center gap-3 w-full relative hover:bg-[#635EF1] cursor-pointer rounded-l-lg p-3 my-3'>
                            {item.icon}
                            <span className='hidden md:block'>{item.text}</span>
                            {
                                         item.text === "Notification" && likeNotification.length > 0 && (
                                            <Popover onOpenChange={handlePopoverChange}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                                                    >
                                                        {likeNotification.length}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div>
                                                        {likeNotification.length === 0 ? (
                                                            <p>No new notifications</p>
                                                        ) : (
                                                            likeNotification.map((notification) => (
                                                                <div key={notification.userId} className="flex items-center gap-2 my-2">
                                                                    <Avatar>
                                                                        <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                        <AvatarFallback>CN</AvatarFallback>
                                                                    </Avatar>
                                                                    <p className="text-sm">
                                                                        <span className="font-bold">{notification.userDetails?.username}</span> liked your post
                                                                    </p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    
                                    }
                        </div>
                    )
                })
            }
         
        </div>
        
        <CreatePost open={open}  setopen={setopen}/>
    </div>

  )
}

export default LeftSideBar

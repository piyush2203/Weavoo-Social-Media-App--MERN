/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import {Input} from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {Textarea} from "./ui/textarea"
import { Button } from './ui/button';
import { readFileAsDataUrl } from '../lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from './redux/postSlice';
import { useNavigate } from 'react-router-dom';



const CreatePost = ({open, setopen}) => {
    const imageRef = useRef();
    const [file,setfile] = useState("");
    const [caption, setcaption] = useState("");
    const [imagePreview, setimagePreview] = useState("");
    const [loading, setloading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    if(!user){
        navigate("/login");
    }
    const {posts} = useSelector(store=>store.post);

    const dispatch = useDispatch();
    // console.log("profile picture", user);
    
    // Post Creation Handler
    const createPostHandler = async(e) =>{
        const formData = new FormData();
        formData.append("caption", caption);
        if (imagePreview) formData.append("image", file);
        try {
            setloading(true);
            const res = await axios.post('https://weavoo.onrender.com/api/v1/post/addpost', formData, {
                headers: {
                'Content-Type': 'multipart/form-data'
            },
                withCredentials: true
        });
        // console.log(res);
        
        if (res.data.success) {
            dispatch(setPosts([res.data.post, ...posts]));// [1] -> [1,2] -> total element = 2
            toast.success(res.data.message);
            setopen(false);
      }
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
            
        } finally {
            setloading(false);
        }
    }

    //file changing handler
    const fileChangeHandler = async(e)=>{
    const file = e.target.files?.[0];
    if(file){
        setfile(file);
        const dataUrl = await readFileAsDataUrl(file);
        setimagePreview(dataUrl);
    } 
}

  return (
    <Dialog open={open}>
        <DialogContent onInteractOutside={()=>setopen(false)}>
            <DialogHeader className="font-semibold text-xl text-center" >Create New Post</DialogHeader>
            <div className='flex gap-3 items-center'>
                <Avatar className='border-black border-2'>
                    <AvatarImage src={user?.profilePicture}  alt="img"/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className='font-semibold text-xs'>{user?.username}</h1>
                    <span className='text-sm text-gary-600'>{user?.bio}</span>
                </div>
            </div>
            <Textarea value={caption} onChange={(e)=> setcaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Write a Caption..." />
            {
                imagePreview && (
                    <div className='w-full h-50  flex justify-center items-center justify-center'>
                        <img src={imagePreview} alt="preview_image" className='h-full w-full object-cover ' />
                    </div>
                )
            }
            <input ref={imageRef} type="file" className='hidden' onChange={fileChangeHandler}/>
            <Button onClick={()=>imageRef.current.click()} className="w-fit mx-auto bg-[#0095F6] hover:bg-blue-900">Select from computer</Button>
            {
                imagePreview && (
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please Wait
                        </Button>
                    ):(
                        <Button className="w-full " type="submit" onClick={createPostHandler} >Post</Button>
                    )
                )
            }
        </DialogContent>
    </Dialog>
  )
}

export default CreatePost

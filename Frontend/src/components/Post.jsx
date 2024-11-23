/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// import { Avatar } from '@radix-ui/react-avatar'
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {Dialog, DialogContent, DialogTrigger} from "./ui/dialog"
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialogue from "./CommentDialogue";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "./redux/postSlice";
import { Badge } from "@/components/ui/badge"
import { FaBookmark } from "react-icons/fa6";



const Post = ({post}) => {

    const [text, settext] = useState("");
    const [open, setopen] = useState(false);
    const {user} = useSelector(state=>state.auth);
    const {posts} = useSelector(state=>state.post);
    // const [bookmark, setbookmark] = useState(false);
    
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);

    const dispatch = useDispatch();


    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if(inputText.trim()){
            settext(inputText); 
        }else{
            settext("");
        }
    }


    const likeOrDislikeHandler = async () => {
      try {
          const action = liked ? 'dislike' : 'like';
          const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
          console.log(res.data);
          if (res.data.success) {
              const updatedLikes = liked ? postLike - 1 : postLike + 1;
              setPostLike(updatedLikes);
              setLiked(!liked);


              // apne post ko update krunga
              const updatedPostData = posts.map(p =>
                  p._id === post._id ? {
                      ...p,
                      likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                  } : p
              );
              dispatch(setPosts(updatedPostData));


              toast.success(res.data.message);
          }
      } catch (error) {
          console.log(error);
      }
  }



  const commentHandler = async () => {

    try {
        const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`, { text }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(res.data);
        if (res.data.success) {
            const updatedCommentData = [...comment, res.data.comment];
            setComment(updatedCommentData);

            const updatedPostData = posts.map(p =>
                p._id === post._id ? { ...p, comments: updatedCommentData } : p
            );

            dispatch(setPosts(updatedPostData));
            toast.success(res.data.message);
            settext("");
        }
    } catch (error) {
        console.log(error);
    }
}


const bookmarkHandler = async()=>{
  try {
    const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, {withCredentials:true} );
    if(res.data.success){
      toast.success(res.data.message)
      
    }
  } catch (error) {
    console.log(error);
    toast(error.message)
    
  }
}


const handleShare = async () => {
  try {
    const currentUrl = window.location.href; // Get the current URL
    await navigator.clipboard.writeText(currentUrl); // Copy to clipboard
    toast('Link copied to clipboard!');
  } catch (err) {
    // console.error('Failed to copy link: ', err);
    toast('Failed to copy the link. Please try again!');
  }
};





    const deletePostHandler = async()=>{
      try {
        const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post._id}`, {withCredentials:true});
        if(res.data.success){
          const updatedPostData = posts.filter((postItem)=> postItem._id !== post._id);
          dispatch(setPosts(updatedPostData));
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
        
      }
    }

  return (
    <div className="my-8 w-full bg-white rounded-md max-w-sm mx-auto">
      <div className="flex items-center justify-between px-[4%] pt-[3%]">
        <div className="flex items-center gap-3">
          <Avatar  alt="post image"  className="w-8 bg-blue-200 h-8">
            <AvatarImage src={post.author.profilePicture}/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="text-[1vw] font-medium ">{post.author.username}</h1> 
          {(user._id === post.author._id)&& <Badge variant="secondary">Author</Badge>}
        </div>
        <Dialog >
            <DialogTrigger asChild>
                <MoreHorizontal className="cursor-pointer"/>
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center text-sm text-center">
              {
                post?.author._id != user._id && <Button className="cursor-pointer w-fit text-[#ED4956] bg-white hover:bg-gray-300" variants="ghost">Unfollow</Button>
              }
                
                <Button className="cursor-pointer w-fit  bg-white text-black hover:bg-gray-300" variants="ghost">Add To Favourite</Button>
                {user && user._id === post.author._id &&
                  <Button onClick={deletePostHandler} className="cursor-pointer w-fit  bg-white text-black hover:bg-gray-300" variants="ghost">
                  Delete</Button>
                }
                
            </DialogContent>
        </Dialog>
      </div>
      <img className="rounded-sm my-3 w-full  object-fit" src={post.image} alt="sgad" />

      <div>
        <div className="flex my-2 px-[3%] items-center justify-between">
        <div className="flex gap-4 items-center">
          {/* like comment share */}
          {
            liked ? <FaHeart onClick={likeOrDislikeHandler} size={'22px'} className="cursor-pointer hover:text-gray-600 text-red-600"/> 
             : 
            <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className="cursor-pointer hover:text-gray-600 text-"/> 
          }
            {/* <FaHeart onClick={likeOrDislikeHandler} size={'22px'} className="cursor-pointer hover:text-gray-600"/>  */}
            <MessageCircle onClick={()=>{ dispatch(setSelectedPost(post)); setopen(true) } } className="cursor-pointer hover:text-gray-600"/>
            <Send className="cursor-pointer hover:text-gray-600" onClick={handleShare}/>
        </div>
        <div>
          {
            <Bookmark onClick={()=>{bookmarkHandler()} } className="cursor-pointer hover:text-gray-600"/>
          }
            
        </div>
      </div>
      </div>
      <span className="font-medium block mb-2 px-[3%]">{post.likes.length} likes</span>
      <p className="px-[3%] text-sm ">
        <span className="font-medium mr-1">{post.author.username}</span>
        {post.caption}
     </p>
     {
      comment.length >0 &&
      <p onClick={()=>{ dispatch(setSelectedPost(post)); setopen(true) } } className="cursor-pointer text-sm text-slate-800  pt-[8px] px-[3%]">
        View all {comment.length} Comments
     </p>

     }

      <div className="text-[1.7vh] text-slate-800 px-[3%] font-bold pt-[3%]"> {post?.createdAt?.split('T')[0]}</div>
     
     
     <CommentDialogue open={open} setopen={setopen} />
     <div className="flex justify-between items-center px-[3%]">
        <input type="text" value={text} onChange={changeEventHandler} className="bg-transparent py-[3%] w-[70%] text-sm outline-none" placeholder="Add a Comment..." />
        {
            text && (<span onClick={commentHandler} className="text-blue-500  mr-[2%] cursor-pointer ">Post</span>)
        }
     </div>
     
    </div>
  );
};

export default Post;

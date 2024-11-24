/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "./redux/postSlice";

const CommentDialogue = ({ open, setopen }) => {

    const [text, setText] = useState("");
    const {selectedPost} = useSelector(store=>store.post);
    const [comment, setcomment] = useState([]);
    const dispatch = useDispatch();
    const {posts} = useSelector(state=>state.post);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
          setText(inputText);
        } else {
          setText("");
        }
    }

    useEffect(() => {
      if(selectedPost){
        setcomment(selectedPost.comments)
      }
    }, [selectedPost])
    



    const commentHandler = async () => {

      try {
          const res = await axios.post(`https://weavoo.onrender.com/api/v1/post/${selectedPost._id}/comment`, { text }, {
              headers: {
                  'Content-Type': 'application/json'
              },
              withCredentials: true
          });
          // console.log(res.data);
          if (res.data.success) {
              const updatedCommentData = [...comment, res.data.comment];
              setcomment(updatedCommentData);
  
              const updatedPostData = posts.map(p =>
                  p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
              );
  
              dispatch(setPosts(updatedPostData));
              toast.success(res.data.message);
              setText("");
          }
      } catch (error) {
          console.log(error);
      }
  }

  return (
    
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setopen(false)}
        className="max-w-5xl p-0 flex flex-col"
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between">
            <div className="flex overflow-auto items-center justify-between p-4">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div >
                  <Link className="font-semibold text-xs">
                    {selectedPost?.author?.username}
                  </Link>
                  {/* <span className='text-gray-600  text-sm'>Bio here...</span> */}
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                    Unfollow
                  </div>
                  <div className="cursor-pointer w-full">Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>
            <hr />
            <div className="flex-1 overflow-y-auto max-h-56 p-4">
              {comment.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={commentHandler}
                  variant="outline"
                  className="bg-slate-300"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialogue;

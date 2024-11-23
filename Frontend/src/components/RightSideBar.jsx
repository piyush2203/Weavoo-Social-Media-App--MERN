/* eslint-disable no-unused-vars */
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';


const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  return (
    <div className='w-[22%] rounded-md h-[60%] overflow-auto mt-[5%] mr-[2%] bg-black border-2 border-gray-700 my-0 hidden md:block'>
      <div className='flex pt-[5%] px-[5%] items-center gap-2 border-b-[0.1vw] pb-5 border-gray-500 gap-3'>
        <Link to={`/profile/${user?._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className='font-semibold text-white text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
          <span className='text-white text-sm'>{user?.bio || 'Bio here...'}</span>
        </div>
      </div>
      <SuggestedUsers/>
    </div>
  )
}

export default RightSidebar
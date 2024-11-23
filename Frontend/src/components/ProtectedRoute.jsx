/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
    const user = useSelector(store=>store.auth)
    const navigate = useNavigate();
    useEffect(()=>{
        if(!user){
            navigate("/login");
        }
    },[])
  return (
    <> 
    {children}
    </>
  )
}

export default ProtectedRoute

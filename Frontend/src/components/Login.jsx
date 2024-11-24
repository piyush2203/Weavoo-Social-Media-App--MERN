/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {Input} from "./ui/input"
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "./redux/authSlice";


const Signup = () => {
    const [input, setinput] = useState({
        
        email:"",
        password:""
    })

    // const user = useSelector(store => store.auth);
    // useEffect(()=>{
    //   if(user){
    //     navigate("/")
    //   }
    // },[])

    const [loading, setloading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setinput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        console.log(input);
        
        try {
            setloading(true);
            const res = await axios.post('https://weavoo.onrender.com/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setinput({
                   
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
            
        }finally{
            setloading(false);
        }
    }
    


  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form action="" onSubmit={signupHandler}  className="shadow-lg flex flex-col gap-5 p-8">
        <div className="my-4 flex flex-col items-center justify-center gap-2">
          <h1 className="text-center font-bold text-xl "><img src="/logos.png" alt="" className="h-20 w-50"/></h1>
          <p className="text-sm text-center ">
            Signup to see photos & videos from your friends
          </p>
        </div>

        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent mt-2"
          />
        </div>

        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent mt-2"
          />
        </div>

        {
            loading ? (
                <Button > 
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </Button>
            ) : (
                <Button type="submit">Login</Button>
            )
        }


        

        <span className='text-center flex flex-col gap-2'>Wanna create an Account ? <Link to={"/signup"}> <Button>Signup</Button> </Link> </span>

        
      </form>
    </div>
  );
};

export default Signup;

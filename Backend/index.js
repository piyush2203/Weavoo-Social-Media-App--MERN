import express, { urlencoded } from 'express';
import cors from 'cors'; //cross origin resource sharing 
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.router.js"
import messageRoute from "./routes/message.route.js"
import { app,server } from './Socket/socket.js';
import path from "path";

dotenv.config({});



const PORT = process.env.PORT || 8000;
const __dirname = path.resolve(); //gives the location of the backend folder




app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOptions = {
    origin: process.env.URL,
    credentials:true
}
app.use(cors(corsOptions));


//yaha par apni api ayengi
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

app.use(express.static(path.join(__dirname, "/Frontend/dist")));
app.get("*", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
})

server.listen(PORT, ()=>{
    connectDB();
    console.log(`Server listen at ${PORT}`);
    
})
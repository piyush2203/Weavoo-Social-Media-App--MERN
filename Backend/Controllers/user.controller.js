import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookies from 'cookies';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";



export const register = async(req,res)=>{

    try {
        const {username, email, password} = req.body;
        if(!username|| !password || !email){
            return res.status(401).json({
                message:"Something is missing, Please Check",
                success:false,
            });
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                message:"Email Already Exist",
                success:false,
            })
        };

        const hashedPassword = await bcrypt.hash(password,10);
        await User.create({
            username,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            message:"Account created successfully",
            success:true,
        });


    } catch (error) {
        console.log(error);
        
    }
}




export const login = async(req,res)=>{
    try {
        const { email, password} = req.body;
        if(!password || !email){
            return res.status(401).json({
                message:"Something is missing, Please Check",
                success:false,
            });
        }
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Incorrect Password or Email",
                success:false,
            });
        };

        const PasswordMatch = await bcrypt.compare(password, user.password)
        if(!PasswordMatch){
            return res.status(401).json({
                message:"Incorrect Password or Email",
                success:false,
            });
        }
        const token = await jwt.sign({userId:user._id}, process.env.SECRET_KEY,{expiresIn:'9d'});

        //populate each post if in the post array
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId)=>{
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )

        user= {
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            posts:populatedPosts
        }

        
        return res.cookie('token', token, {httpOnly: true, sameSite:'strict', maxAge:1*24*60*60*1000}).json({
            message:`Welcome Back ${user.username}`,
            success:true,
            user
        })

    } catch (error) {
        console.log(error);
    }
};

export const logout = async (req, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};


export const getProfile = async(req,res)=>{
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts' ,createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}


export const editProfile = async(req,res)=>{
    try {
        const userId = req.id;
        const {bio,gender} = req.body;
        const profilePicture = req.file;
        let cloudResponse;
        if(profilePicture){
            const fileURI = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileURI)
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:'User Not Found',
                success:false
            })
        };
        if(bio) user.bio = bio;
        if(gender) user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message:"Profile Updated ",
            success:true,
            user
        }) 
        
    } catch (error) {
        console.log(error);
        
    }
}


export const getSuggestedUser = async(req,res)=>{
    try {

        let suggestedUser = await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUser){
            return res.status(404).json({
                message:"No User till now",
                
            })
        }

        return res.status(202).json({
            success:true,
            users:suggestedUser
        })
    } catch (error) {
        console.log(error);  
    }
}


export const followOrUnfollow = async(req,res)=>{
    try {
        let followkrneWala = req.id; //piyush
        let jiskoFollowKrega = req.params.id; //she

        if(followkrneWala === jiskoFollowKrega){
        return res.status(404).json({
            message:"you cannot follow or unfollow yourself",
            success:false
            })
        }

        const user = await User.findById(followkrneWala);
        const targetUser = await User.findById(jiskoFollowKrega);

        if(!user || !targetUser){
            return res.status(404).json({
                message:"User not found",
                success:false
            })
        }

        const isFollowing = user.following.includes(jiskoFollowKrega);
        if (isFollowing) {
        // unfollow logic
          await Promise.all([
                User.updateOne({_id:followkrneWala}, {$pull:{following:jiskoFollowKrega}}),
                User.updateOne({_id:jiskoFollowKrega}, {$pull:{followers:followkrneWala}}),
            ])
            return res.status(200).json({
                message:"Unfollowed successfully",
               success:true
            })
        } else {
            // follow logic
            await Promise.all([
                User.updateOne({_id: followkrneWala}, {$push:{following:jiskoFollowKrega}}),
                User.updateOne({_id: jiskoFollowKrega}, {$push:{followers:followkrneWala}})
            ]);
            return res.status(200).json({
                message:"Followed successfully",
                success:true
            })
    }
    } catch (error) {
        console.log(error);
    }

}
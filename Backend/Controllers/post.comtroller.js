import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import {Comment} from "../models/comment.model.js"
import { getReceiverSocketId, io } from "../Socket/socket.js";



export const addNewPost = async(req,res)=>{
    
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })


    } catch (error) {
        console.log(error);
        
    }
}



export const getAllPost = async(req,res)=>{
    try {
        const post = await Post.find().sort({createdAt:-1})
        .populate({path:'author', select:'username profilePicture'})
        .populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilePicture' 
            }
        });
        return res.status(200).json({
            post,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}


export const getUserPost = async(req,res)=>{
    try {
        const authorId = req.id;
        const posts = await Post.find({author:authorId}).sort({createdAt:-1}).populate({
            path:'author',
            select:'username, profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success:true
        })
    } catch (error) {
        console.log(error);  
    }
}


export const likePost = async(req,res)=>{
    try {
        const likeKrneWalaUserKiId = req.id;
        const PostId  = req.params.id;
        const post = await Post.findById(PostId);

        if(!post){
            return res.status(404).json({
                message:"Post not found",
                success:true
            })
        }

        //like logic
        await post.updateOne({$addToSet:{likes: likeKrneWalaUserKiId}});
        await post.save();

        //socket.io implementation for real time notification
        const user= await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            //emit a notification event
            const notification = {
                type:'like',
                userId: likeKrneWalaUserKiId,
                userDetails:user,
                PostId,
                message:'Your Post Was Liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification)
        }

        return res.status(200).json({
            message:"post liked",
            success:true
        })

    } catch (error) {
        console.log(error);  
    }
}



export const dislikePost = async(req,res)=>{
    try {
        const likeKrneWalaUserKiId = req.id;
        const PostId  = req.params.id;
        const post = await Post.findById(PostId);

        if(!post){
            return res.status(404).json({
                message:"Post not found",
                success:true
            })
        }

        //dislike logic
        await post.updateOne({$pull:{likes: likeKrneWalaUserKiId}});
        await post.save();

        //socket.io implementation for real time notification
        const user= await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            //emit a notification event
            const notification = {
                type:'dislike',
                userId: likeKrneWalaUserKiId,
                userDetails:user,
                PostId,
                message:'Your Post Was Liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification)
        }

        return res.status(200).json({
            message:"post disliked",
            success:true
        })

    } catch (error) {
        console.log(error);  
    }
}


export const addComment = async(req,res)=>{
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;


        const {text} = req.body;
        const post = await Post.findById(postId);

        if(!text){
            return res.status(400).json({
                message:"text is required",
                success:false
            });
        }

        const comment = await Comment.create({
            text,
            author:commentKrneWalaUserKiId,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:"Comment added",
            comment,
            success:true
        })


    } catch (error) {
        console.log(error);
        
    }
};


export const getCommentOfPost = async(req,res)=>{
    try {
        const postId = req.params.id;
        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments){
            return res.status(404).json({
                message:"No Comments found in this post", 
                success:false
            })

        }

        return res.status(200).json({
            success:true,
            comments
        });

    } catch (error) {
        console.log(error);
        
    }
};


export const deletePost = async(req,res)=>{
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message:"Post not found ",
                success:false
            })
        }

        //check if logged in user is owner or not
        if(post.author.toString() !== authorId){
            return res.status(403).json({
                message:"Unauthorized",
                success:false
            })

        }

        //delete post
        await Post.findByIdAndDelete(postId);


        //remove the post id from the user post

        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();


        //delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            message:'Post Deleted',
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}


export const bookmarkPost = async(req,res)=>{
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message:"Post Not Found",
                success:false
            })
        };

        const user = await User.findById(authorId);
        if(user.bookmarks.includes(postId)){
            //already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({
                message:"Post removed from bookmark",
                type:'unsaved',
                success:true
            })
        }else{

            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({
                type:"saved",
                message:"Post Bookmarked",
                success:true
            })
        }
    } catch (error) {
        console.log(error);
        
    }
}

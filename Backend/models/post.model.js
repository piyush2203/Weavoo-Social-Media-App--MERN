import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        caption: { type: String, default: '' },
        image: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    },
    { timestamps: true } // This enables createdAt and updatedAt fields
);

export const Post = mongoose.model('Post', PostSchema);

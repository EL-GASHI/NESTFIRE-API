import Post from "../models/Post.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { deleteLocalFile, uploadImage } from "../middleware/fileUtils.js";
import { validatePost } from "../validations/postValidation.js";
import mongoose from "mongoose";

/**
 * @method POST
 * @access Private
 * @path /posts
 * @description Creates a new post.
 */
export const createPost = async (req, res) => {
  const { title, body, tags } = req.body;

  try {
    const newPost = new Post({
      title,
      body,
      tags,
      user: req.user.id,
    });

    if (req.files && req.files.length > 0) {
      const images = await Promise.all(
        req.files.map(async (file) => {
          const { url, public_id } = await uploadImage(file.path);
          deleteLocalFile(file.path);
          return { url, publicId: public_id };
        })
      );
      newPost.media = images;
    }

    const savedPost = await newPost.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: savedPost._id }
    });

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
};

/**
 * @method GET
 * @access Public
 * @path /posts
 * @description Retrieves all posts with pagination.
 */
export const getAllPosts = async (req, res) => {
  const { limit = 5, page = 0 } = req.query;
  const skip = page * limit;

  try {
    const posts = await Post.find()
      .populate("user", "firstName lastName isVerified profileImage status postsLike profileLogo")
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

/**
 * @method GET
 * @access Public
 * @path /posts/:id
 * @description Retrieves a single post by ID.
 */
export const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id).populate("user", "firstName lastName postsLike");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching post",
      error: error.message,
    });
  }
};

/**
 * @method DELETE
 * @access Private
 * @path /posts/:id
 * @description Deletes a post and updates the user's post array.
 */
export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You do not own this post" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.posts = user.posts.filter(postId => !postId.equals(post._id));

    await user.save();

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
};

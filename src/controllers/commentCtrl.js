import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { validateComment } from "../validations/commentValidation.js";

/**
 * @method POST
 * @access Private
 * @path /comments
 * @description Creates a new comment on a post.
 */
export const createComment = async (req, res) => {
  const { error } = validateComment(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const { body } = req.body;

  try {
    const user = req.user.id;

    const post = await Post.findById(req.body.post);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      body,
      user,
      post: req.body.post,
    });

    const comment = await newComment.save();
    await Post.findByIdAndUpdate(req.body.post, {
      $push: { comments: comment._id },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.log("Error creating comment:", error);
    res.status(500).json({ message: "Error creating comment", error: error.message });
  }
};

/**
 * @method GET
 * @access Public
 * @path /comments/:postId
 * @description Retrieves comments for a specific post.
 */
export const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId }).populate(
      "user",
      "firstName lastName email profileImage -_id"
    ).populate({
      path: 'replies.user',
      select: 'firstName lastName profileImage -_id'
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

/**
 * @method PATCH
 * @access Private
 * @path /comments/:commentId
 * @description Updates a specific comment.
 */
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { body } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.body = body;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error: error.message });
  }
};

/**
 * @method DELETE
 * @access Private
 * @path /comments/:commentId
 * @description Deletes a specific comment.
 */
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.remove();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

/**
 * @method POST
 * @access Private
 * @path /comments/:commentId/replies
 * @description Adds a reply to a specific comment.
 */
export const addReply = async (req, res) => {
  const { commentId } = req.params;
  const { body } = req.body;

  try {
    const user = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = {
      body,
      user,
      createdAt: Date.now(),
    };

    comment.replies.push(reply);
    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error adding reply", error: error.message });
  }
};

/**
 * @method DELETE
 * @access Private
 * @path /comments/:commentId/replies/:replyId
 * @description Removes a reply from a specific comment.
 */
export const removeReply = async (req, res) => {
  const { commentId, replyId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (comment.replies[replyIndex].user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.replies.splice(replyIndex, 1);
    await comment.save();

    res.status(200).json({ message: "Reply removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing reply", error: error.message });
  }
};

/**
 * @method PATCH
 * @access Private
 * @path /comments/:commentId/replies/:replyId
 * @description Add Like Or Remove Like.
 */
export const addRemoveLike = async (req, res) => {
  const { like, post: postId } = req.body;
  const user = req.user;

  try {
    if (!user || !postId) {
      return res.status(400).json({ message: "User and Post ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post does not exist" });
    }

    const userx = await User.findById(user.id);
    const hasLiked = userx.postsLike.includes(postId);

    if (like) {
      if (hasLiked) {
        return res.status(400).json({ message: "You have already liked this post" });
      }

      await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });
      await User.findByIdAndUpdate(user.id, { $push: { postsLike: postId } });
      return res.status(200).json({ message: "Liked successfully" });
    } else {
      if (!hasLiked) {
        return res.status(400).json({ message: "You have not liked this post yet" });
      }

      await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
      await User.findByIdAndUpdate(user.id, { $pull: { postsLike: postId } });
      return res.status(200).json({ message: "Disliked successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating like status", error: error.message });
  }
};

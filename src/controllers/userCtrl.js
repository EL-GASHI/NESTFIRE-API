import User from "../models/User.js";
import cloudinary from "../config/cloudinaryConfig.js";
import bcrypt from "bcrypt";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../validations/userValidation.js";
import { deleteLocalFile, uploadImage } from "../middleware/fileUtils.js";
import Notification from "../models/Notification.js";

/**
 * @method PUT
 * @access Private
 * @path /users/:id
 * @description Updates a user's profile.
 */
export const updateUser = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res
      .status(400)
      .json({ message: "you can't update profile of others" });
  }

  try {
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    const userUpdates = { ...req.body };
    if (hashedPassword) {
      userUpdates.password = hashedPassword;
    }

    if (req.file) {
      try {
        const { url, public_id } = await uploadImage(req.file.path);
        userUpdates.profileImage = { url, publicId: public_id };
        deleteLocalFile(req.file.path);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error uploading image", error: error.message });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      userUpdates,
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};

/**
 * @method GET
 * @access Public
 * @path /users/:id
 * @description Retrieves a user by ID.
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

/**
 * @method DELETE
 * @access Private
 * @path /users/:id
 * @description Deletes a user.
 */
export const deleteUser = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(400).json({ message: "Access denied" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    if (deletedUser.profileImage) {
      await cloudinary.uploader.destroy(deletedUser.profileImage.public_id);
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

/**
 * @method GET
 * @access Public
 * @path /users
 * @description Retrieves all users or users filtered by name.
 */
export const getAllUsers = async (req, res) => {
  const { name } = req.query;

  try {
    const query = name
      ? {
          $or: [
            { firstName: new RegExp(name, "i") },
            { lastName: new RegExp(name, "i") },
          ],
          accountPrivacy: { $ne: "private" }
        }
      : {};

    const users = await User.find(query).select("-password").limit(10);
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

/**
 * @method PUT
 * @access Private
 * @path /users/:id/follow
 * @description Adds or removes a user from followers and following.
 */
export const toggleFollow = async (req, res) => {
  const { action } = req.body;
  const { id: targetUserId } = req.params;

  try {
    const currentUserId = req.user.id;
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "add") {
      await User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: currentUserId } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: targetUserId } },
        { new: true }
      );
      const notification = new Notification({
        body: `${currentUser.firstName} ${currentUser.lastName} started following you.`,
        link: `/user/${currentUserId}`,
        user: targetUserId,
      });
      await notification.save();
    } else if (action === "remove") {
      await User.findByIdAndUpdate(
        targetUserId,
        { $pull: { followers: currentUserId } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { following: targetUserId } },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updatedTargetUser = await User.findById(targetUserId);
    const updatedCurrentUser = await User.findById(currentUserId);
    return res.status(200).json({
      message: "Success",
      followers: updatedTargetUser.followers,
      following: updatedCurrentUser.following,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

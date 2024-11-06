import fs from "fs";
import cloudinary from "../config/cloudinaryConfig.js";

// Uploads a file (image or video) to Cloudinary
export const uploadImage = async (filePath) => {
  try {
    const { url, public_id } = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      resource_type: "auto",
    });
    return { url, public_id };
  } catch (error) {
    throw new Error("Error uploading file: " + error.message);
  }
};

// Deletes a local file from the filesystem
export const deleteLocalFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return reject(new Error("Error deleting file: " + err.message));
      }
      console.log("File deleted successfully:", filePath);
      resolve();
    });
  });
};

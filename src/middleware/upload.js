// import multer from "multer";

// // Configures storage for uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // Creates a multer instance for file uploads
// const upload = multer({ storage });

// export default upload;
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the upload directory path
const uploadDir = path.join(process.cwd(), 'uploads');

// Check if the uploads directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });  // Create the directory if it doesn't exist
}

// Configure the storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the upload destination
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using the current timestamp
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Create the multer upload instance
const upload = multer({ storage });

export default upload;


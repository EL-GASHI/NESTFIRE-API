import multer from "multer";

// Configures storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Creates a multer instance for file uploads
const upload = multer({ storage });

export default upload;

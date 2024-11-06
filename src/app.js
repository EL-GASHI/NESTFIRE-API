import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoute from "./routes/userRoutes.js";
import authRoute from "./routes/auth.js";
import postRoute from "./routes/postRouter.js";
import notificationRoute from "./routes/notificationRoutes.js";
import commentRoute from "./routes/commentRoutes.js";
import path from 'path';

dotenv.config();


const app = express();


import { fileURLToPath } from 'url';

// الحصول على المسار الحالي للملف
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


connectDB();

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/comments", commentRoute);

app.get("/", (req, res) => {
  res.send("API is running...");
});


export default app;

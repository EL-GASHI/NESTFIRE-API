import express from "express";
import {
  updateUser,
  getUserById,
  deleteUser,
  getAllUsers,
  toggleFollow,
} from "../controllers/userCtrl.js";
import upload from "../middleware/upload.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put(
  "/:id",
  authenticateToken,
  upload.single("profileImage"),
  updateUser
);
router.get("/:id", getUserById);
router.delete("/:id", authenticateToken, deleteUser);
router.get("/", getAllUsers);

// Combined Followers and Following route
router.put("/:id/follow", authenticateToken, toggleFollow);

export default router;

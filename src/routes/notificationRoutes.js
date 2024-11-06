import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationsByUser,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationCtrl.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", authenticateToken, getAllNotifications);
router.get("/user", authenticateToken, getNotificationsByUser);
router.get("/:id", authenticateToken, getNotificationById);
router.put("/:id", authenticateToken, updateNotification);
router.delete("/:id", authenticateToken, deleteNotification);

export default router;

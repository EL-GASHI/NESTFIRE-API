import Notification from "../models/Notification.js";

/**
 * @method POST
 * @access Private
 * @path /notifications
 * @description Creates a new notification.
 */
export const createNotification = async (req, res) => {
  const { body, link, user } = req.body;

  try {
    const newNotification = new Notification({
      body,
      link,
      user: req.body.user,
    });

    const savedNotification = await newNotification.save();
    res.status(201).json({
      message: "Notification created successfully",
      notification: savedNotification,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
};

/**
 * @method GET
 * @access Private
 * @path /notifications
 * @description Retrieves all notifications.
 */
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

/**
 * @method GET
 * @access Private
 * @path /notifications/user/:userId
 * @description Retrieves notifications for a specific user.
 */
export const getNotificationsByUser = async (req, res) => {
  const user = req.user.id;

  try {
    const notifications = await Notification.find({ user }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

/**
 * @method GET
 * @access Private
 * @path /notifications/:id
 * @description Retrieves a single notification by ID.
 */
export const getNotificationById = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notification", error: error.message });
  }
};

/**
 * @method PATCH
 * @access Private
 * @path /notifications/:id
 * @description Updates a notification's state.
 */
export const updateNotification = async (req, res) => {
  const { id } = req.params;
  const { state } = req.body;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only allow the user who created the notification to update it
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to change this notification" });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { state },
      { new: true }
    );

    res.status(200).json({
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

/**
 * @method DELETE
 * @access Private
 * @path /notifications/:id
 * @description Deletes a notification.
 */
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only allow the user who created the notification to delete it
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error: error.message });
  }
};

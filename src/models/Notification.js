import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 300,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

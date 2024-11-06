import mongoose from "mongoose";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    status: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: (v) => {
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    accountPrivacy: {
      type: String,
      enum: ["public", "private", "friend"],
      default: "public",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    postsLike: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    profileLogo: {
      type: String
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate colors
userSchema.pre("save", function (next) {
  if (!this.profileLogo) {
    const allowedColors = ['#FF6F61', '#FF9F00', '#FF3D00', '#D50032', '#C51162', '#6200EA', '#00BFAE', '#00C853', '#FFD600', '#FF5252'];
    this.profileLogo = allowedColors[Math.floor(Math.random() * allowedColors.length)]; // Pick a random logo color from allowed colors
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;

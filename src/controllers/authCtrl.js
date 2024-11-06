import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateCreateUser } from "../validations/userValidation.js";
import nodemailer from "nodemailer";

const sendError = (res, status, message) => res.status(status).json({ message });
const sendSuccess = (res, status, data) => res.status(status).json(data);
const generateToken = (userId, expiresIn = "10d") => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
const sendResetEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>To reset your password, click <a href="nestfire://reset-password/${resetToken}">here🔥🔥</a>.</p>`,
  });
};

/**
 * @method POST
 * @access Public
 * @path /register
 * @description Registers a new user and returns a token.
 */
export const registerUser = async (req, res) => {
  const { error } = validateCreateUser(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 400, "Email already in use!");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, phone, password: hashedPassword });

    await newUser.save();
    const token = generateToken(newUser._id);

    sendSuccess(res, 201, { message: "User registered successfully!", token, user: newUser });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
};

/**
 * @method POST
 * @access Public
 * @path /login
 * @description Authenticates a user and returns a token.
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 404, "User not found!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials!");

    const token = generateToken(user._id, "100h");

    sendSuccess(res, 200, { token, user });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
};

/**
 * @method POST
 * @access Public
 * @path /forgot-password
 * @description Sends a password reset link to the user's email.
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 404, "User not found!");

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });
    await sendResetEmail(email, resetToken);

    sendSuccess(res, 200, { message: "Password reset link sent to your email." });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
};

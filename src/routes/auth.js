import express from 'express';
import { registerUser, loginUser, forgotPassword } from '../controllers/authCtrl.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/forgot-password', forgotPassword);

export default router;

import express from 'express';
import {
    createPost,
    getAllPosts,
    getPostById,
    deletePost
} from '../controllers/postCtrl.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { addRemoveLike } from '../controllers/commentCtrl.js';

const router = express.Router();

router.post('/', authenticateToken, upload.array('images'), createPost);
router.get('/', authenticateToken, getAllPosts);
router.get('/:id', authenticateToken, getPostById);
router.delete('/:id', authenticateToken, deletePost);
router.put('/like', authenticateToken, addRemoveLike);

export default router;

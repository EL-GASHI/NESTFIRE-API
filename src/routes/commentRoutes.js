import express from 'express';
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    addReply,
    removeReply
} from '../controllers/commentCtrl.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticateToken, createComment);
router.get('/:postId', getCommentsByPost);
router.put('/:commentId', authenticateToken, updateComment);
router.delete('/:commentId',authenticateToken, deleteComment);
router.post('/:commentId/reply',authenticateToken, addReply);
router.delete('/:commentId/reply/:replyId', removeReply);

export default router;

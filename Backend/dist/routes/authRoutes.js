import express from 'express';
const router = express.Router();
import { getUser, loginUser, logoutUser, refreshTokenUser, registerUser } from '../controller/authController';
import { authenticate } from '../middlewares/authMiddleware';
// Route to register a new user
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshTokenUser);
router.post('/logout', logoutUser);
router.get('/get-user', authenticate, getUser);
// Export the router
export default router;

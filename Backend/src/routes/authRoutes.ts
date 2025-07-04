import express from 'express';

const router = express.Router();
import { loginUser, registerUser } from '../controller/authController';

// Route to register a new user
router.post('/register', registerUser);
router.post('/login', loginUser);

// Export the router
export default router;
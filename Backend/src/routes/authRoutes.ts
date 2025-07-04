import express from 'express';

const router = express.Router();
import { registerUser } from '../controller/authController';

// Route to register a new user
router.post('/register', registerUser);

// Export the router
export default router;
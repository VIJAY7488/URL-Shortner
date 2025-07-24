import express from 'express';
import { redirectUrl } from '../services/userUrlServices';

const router = express.Router();


router.get('/:shortCode', redirectUrl);


export default router;
import express from 'express';
import { config } from 'dotenv';
import logger from './utils/logger';
import connectDB from './config/dbConnection';
import authRoutes from './routes/authRoutes';
import configureCors from './config/corsConfig';
import cookieParser from 'cookie-parser';
import urlRoutes from './routes/urlRoutes.js';
import redirectUrlRoutes from './routes/redirectRoutes';
import analyticsRoutes from './routes/analyticsRoute';
const app = express();
// Load environment variables
config();
const PORT = process.env.PORT || 3001;
//Trust proxy so Express uses real IPs from headers
app.set('trust proxy', true);
// Middleware
app.use(configureCors());
app.use(express.json());
app.use(cookieParser());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/', redirectUrlRoutes);
//Server Listening
connectDB()
    .then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
})
    .catch((err) => {
    logger.error("Failed to connect to DB", err);
});

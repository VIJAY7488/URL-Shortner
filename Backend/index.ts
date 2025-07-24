import express from 'express';
import { config } from 'dotenv';
import logger from './src/utils/logger';
import connectDB from './src/config/dbConnection';
import authRoutes from './src/routes/authRoutes';
import configureCors from './src/config/corsConfig';
import cookieParser from 'cookie-parser';
import urlRoutes from './src/routes/urlRoutes';
import redirectUrlRoutes from './src/routes/redirectRoutes'
import analyticsRoutes from './src/routes/analyticsRoute';

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
app.listen(PORT, () => {
    connectDB();
  logger.info(`Server is running on port ${PORT}`);
});

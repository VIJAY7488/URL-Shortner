import mongoose from "mongoose";
import logger from "../utils/logger"; 

const connectDB = async (): Promise<void> => {
  const dbURI = process.env.MONGODB_URI;
  if (!dbURI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(dbURI);
    logger.info("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB connection reestablished");
    });
  } catch (err) {
    logger.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;

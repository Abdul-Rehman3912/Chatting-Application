import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`mongoDB Connected ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
    
  }
};

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dbURI = process.env.DB_CONNECTION_STRING;

export const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      dbName: "auth_practice",
    });
    console.log("Database connected!");
  } catch (error) {
    console.log("Error when connect database", error);
    process.exit(1);
  }
};

import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';
import express from "express";

const app = express();

const dbConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`DB connected at host ${connectionInstance.connection.host}`);
    }
    catch (error) {
        console.error("Error at DB_connection: ", error);
        process.exit(1);
    }
}

export default dbConnect;
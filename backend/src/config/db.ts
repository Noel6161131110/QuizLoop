import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

const ConnectDB = async () => {
    try {
        await mongoose.connect(`${MONGODB_URI}`)
            .then(() => {
                console.log("Connected to db")
            })
            .catch((err) => {
                console.log(err)
                console.log("Failed to connect db")
            })
    } catch (error) {
        console.log(error)
    }
}

export default ConnectDB
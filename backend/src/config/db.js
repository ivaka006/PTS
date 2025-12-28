import mongoose from "mongoose"
import dotenv from "dotenv"

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)

        console.log("MONGODB CONNECTED SUCESSFULY")
    }catch (error){
        console.error("Error conncting to BD", error)
        process.exit(1)
    }
}
import mongoose, { connect } from "mongoose";
import { DATA_NAME } from "../constant.js";

const connectDB= async()=>{
    try {
        const connectionInstance =await mongoose.connect(`${process.env.MONGO_URI}/${DATA_NAME}`)
        console.log(`Mongo db connected!! db host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("mongo DB connection failed",error)
        process.exit(1)
    }
}
export default connectDB
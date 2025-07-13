import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config({
    path:'./env'
})
connectDB()



/*const app = express()


(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`/{DATA_NAME})
        console.log("database is connected")
        app.on("error",(error)=>{
            console.log("error",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}` )
        })
    } catch (error) {
       console.log("there is error",error)
       throw err
        
    }
})()*/
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`server is running at port ${process.env.PORT}` )

    })
})
.catch((err)=>{
    console.log("Mongo DB connection Failed",err)

})


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
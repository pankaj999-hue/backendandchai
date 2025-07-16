import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import { use } from "react";


const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        index:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    fullName:{
        type:String,
        required:true,
        lowercase:true,
    },
    avatar:{
        type:String, //cloundinary
        required:true,
    },
    coverImage:{
        type:String,
    },

    password:{
        type:String,
        required:[true,'password is required']
    },
    refreshToken:{
        type:string
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]


},{timestamps:true})
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
    this.password=bcrypt.hash(this.password,10)
    next()
    
})

userSchema.methods.isPasswordCorrect = async function (password){
   await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function (){
    jwt.sign(
        {
            _id:this._id,
            userName:this.userName,
            email:this.email,
            fullNmae:this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expireIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expireIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)
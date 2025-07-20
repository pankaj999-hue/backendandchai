import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/User.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
const userRegister=asyncHandler(async(req,res)=>{
    //take info from a frontend
    //check where it is empty or not
    //verify the email and name is unique
    //add image and avatar
    //upload them in cloudinary, avtar
    //create entry of user in db
    //remove password and token from response
    //check user creration
    //return response
    
    const {name,email,fullName,password}=req.body

    if([name,email,fullName,password].some((field)=>field?.trim()==="")){
        throw new apiError(400,"every field is required")
    }

    const existedUser=User.findOne({
        $or:[{userName},{email}]
    })

    if (existedUser){
        throw new apiError(408,"user already exist")
    }

    const avatarLocalPath=req.file?.avatar[0]?.path
    const coverImageLocalPath=req.file?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw apiError(400,"avatar file is required")
    }

    const avatar=await uploadFileCloudinary(avatarLocalPath)
    const coverImage=await uploadFileCloudinary(coverImageLocalPath)
    
    User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        userName:userName.lowerCase()
    })

    const createrUser=await User.findById(user._id).select(
        "-password -tokenResponse"
    )

    if(createrUser){
        throw apiError(500,"something went wrong while creating user")
    }

    return res.status(201).json(
        new apiResponse(200,createrUser,"user registered successfully")
    )
})

export {userRegister}
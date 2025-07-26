import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/User.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const generateAccessAndRefreshToken=async(userId)=>{
    const user= await User.findById(userId);
    const accessToken=user.generateAccessToken;
    const refreshToken=user.accessRefreshToken;

    user.refreshToken=refreshToken

    refreshToken.save({validatBeforeSave:false})

    return ({accessToken,refreshToken})

}

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
    
    const {name,email,fullName,password,userName}=req.body || {};

    if([name,email,fullName,password,userName].some((field)=>field?.trim()==="")){
        throw new apiError(400,"every field is required")
    }

    if (!req.files?.avatar?.[0]) {
    throw new apiError(400, "Avatar file is required");
    }


    const existedUser=await User.findOne({
        $or:[{userName},{email}]
    })

    if (existedUser){
        throw new apiError(408,"user already exist")
    }

    const avatarLocalPath=req.files.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    console.log("Avatar local path:", avatarLocalPath);

    const avatar=await uploadFileCloudinary(avatarLocalPath)
    if (!avatar) {
    throw new apiError(500, "Failed to upload avatar image");
}
    const coverImage = coverImageLocalPath
    ? await uploadFileCloudinary(coverImageLocalPath)
    : null;
    
    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        userName:userName.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -tokenResponse"
    )

    if(!createdUser){
        throw new apiError(500,"something went wrong while creating user")
    }

    return res.status(201).json(
        new apiResponse(200,createdUser,"user registered successfully")
    )
})

const userLogin=asyncHandler(async(res,req)=>{
    const {userName,email,password}=req.body

    if(!userName || !email){
        throw new apiError(400,"Username or email are required")
    }

    user=User.findOne({
        $or:({userName},{email})
    })

    if(!user){
        throw new apiError(400,"User not found")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(400,"password is incorrect")
    }

    const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options={
        http:true,
        secure:true
    }


    res.status(200).cookie("access token:", accessToken ,options).cookie("refresh token:", refreshToken ,options).
    json(
        apiResponse(200,
            {
                loggedInUser
            }
        )
    )
})

const userLogout=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },{
            new:true
        }
    )
    const options={
        http:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie(accessToken,options)
    .clearCookie(refreshToken,options)
    .json(
        new apiResponse(200,{},"user logged out")
    )
   
})

export {userRegister,userLogin,userLogout}
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/User.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken=async(userId)=>{
    const user= await User.findById(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();

    user.refreshToken=refreshToken

    await user.save();

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

const userLogin=asyncHandler(async(req,res)=>{
    const {userName,email,password}=req.body

    if(!userName && !email){
        throw new apiError(400,"Username or email are required")
    }

    const user=await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new apiError(400,"User not found")
    }
    console.log("Login password:", password);
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        
        throw new apiError(400,"password is incorrect")
    }

    const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options={
        httpOnly:true,
        secure:true
    }


    res.status(200).cookie("accessToken", accessToken ,options).cookie("refreshToken", refreshToken ,options).
    json(
        new apiResponse(200,
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
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new apiResponse(200,{},"user logged out")
    )

   
})
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.headers["refreshtoken"];

  if (!incomingRefreshToken) {
    throw new apiError(400, "Refresh token not provided");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(400, "Invalid refresh token - user not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new apiError(401, "Token mismatch");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    // Optional: update the stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new apiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    console.error("Refresh token error:", error);
    throw new apiError(401, "Invalid or expired refresh token");
  }
});


const changePassword= asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user= await User.findById(req.user?.id)

    const isPasswordCorrect=user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new apiError(401,"password is invalid")
    }

    user.password=newPassword
    user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new apiResponse(200,{},"your password is changed"))

    
})

const currentUser= asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,req.user,"user fetches successfully"))
})

const changeAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!(fullName || email)){
        throw new apiError("fullname and email is required")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email,
            }
        },
        {new:true}

    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"acoount detailed changed successfully"))
})

const updateAvatarImage=asyncHandler(async(res,req)=>{
    const avatarPath=req.file?.path
    if(!avatarPath){
        throw new apiError(400,"avatar image is required")
    }

    const avatar=uploadFileCloudinary(avatarPath)

    if(!avatar){
        throw new apiError(400,"can not access avatar")
    }

    const user =User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Avatar changed successfully"))




})
    
const updateCoverImage=asyncHandler(async(res,req)=>{
    const coverImagePath=req.file?.path
    if(!coverImagePath){
        throw new apiError(400,"avatar image is required")
    }

    const coverImage=uploadFileCloudinary(coverImagePath)

    if(!coverImage){
        throw new apiError(400,"can not access Cover Image")
    }

    const user =User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Cover image changed successfully"))




})



export {userRegister,userLogin,userLogout,refreshAccessToken,changePassword,currentUser,changeAccountDetails,updateAvatarImage,updateCoverImage}
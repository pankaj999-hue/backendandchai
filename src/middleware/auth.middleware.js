import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/User.js";

export const verifyJwt= asyncHandler(async(req,res,next)=>{
    try {
        const authHeader = req.header("Authorization");
        console.log("Cookies:", req.cookies);                     // Check if cookies exist and show accessToken
        console.log("Authorization header:", authHeader);          // Show Authorization header if present
        const token = req.cookies?.accessToken || (authHeader && authHeader.replace("Bearer ", "").trim());
        console.log("Token extracted:", token);
        if (!token) {
        throw new apiError(401, "Access token is missing");
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
        throw new apiError(401, "User not found");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message || "invalid access tokens")
    }
})
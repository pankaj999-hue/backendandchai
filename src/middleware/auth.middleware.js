import jsonwebtoken, { decode } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import res from "express/lib/response";
import { apiError } from "../utils/apiErrors";
import { User } from "../models/User.js";

export const verifyJwt= asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        if (!token){
            throw apiError(401,"Invalid request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken?._id).select("--password --refreshToken")
    
        req.user = user;
        next
    } catch (error) {
        throw apiError(401,error?.message || "invalid access tokens")
    }
})
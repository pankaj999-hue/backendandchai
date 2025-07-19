import fs from  'fs'
import {v2 as cloudinary} from "cloudinary"

const uploadFileCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file uploaded on cloudinary",response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uploadFileCloudinary}